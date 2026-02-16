---
title: "De un docker-compose monolítico a multi-stack: reorganizando mi homelab"
description: "Cómo separé un solo docker-compose.yml en stacks independientes con redes externas, .env por stack y un script de deploy en Raspberry Pi."
date: 2026-02-15
lang: es
translationKey: homelab-multi-stack-restructure
---

![Pi Homelab](/media/reorganizing-my-homelab/pilab.png)

Mi homelab empezó como suelen empezar todos: un único `docker-compose.yml` con todo adentro. Portainer, AdGuard, PostgreSQL, Redis, MySQL, MongoDB... todos vivían en el mismo archivo de 180 líneas.

Funcionaba. Hasta que dejó de ser cómodo.

Quería reiniciar las bases de datos sin tumbar el DNS. Quería agregar un servicio sin leer 180 líneas para entender dónde encajaba. Quería cambiar la contraseña de Redis sin preguntarme si eso rompía algo en Portainer.

No era un problema técnico. Era un problema de organización. Y me costó reconocerlo porque _el archivo funcionaba_.

Esa es la trampa del monolito: no falla, solo duele cada vez más.

---

## Lo primero que intenté (y no funcionó)

Mi primer instinto fue separar en archivos y usar `docker compose -f core.yml -f databases.yml up`. Rápido descubrí que Docker Compose trata múltiples archivos `-f` como un merge, no como stacks independientes. Un `docker compose down` los baja todos.

Necesitaba stacks que fueran realmente independientes. Cada uno con su propio ciclo de vida.

---

## La estructura a la que llegué

```
docker/
├── stacks/
│   ├── core/                    # Portainer + Pi-hole
│   │   ├── docker-compose.yml
│   │   ├── .env
│   │   └── .env.example
│   ├── databases/               # PostgreSQL, Redis, MySQL, MongoDB
│   │   ├── docker-compose.yml
│   │   ├── .env
│   │   └── .env.example
│   ├── apps/                    # Crafty
│   │   ├── docker-compose.yml
│   │   ├── .env
│   │   └── .env.example
│   ├── monitoring/              # (futuro) Prometheus, Grafana
│   └── media/                   # (futuro) Jellyfin, *arr suite
├── scripts/
│   ├── backup-databases.sh
│   └── health-check.sh
├── docs/
├── .env                         # Solo config de red global
└── deploy.sh                    # Script de orquestación
```

Cada stack es un directorio con su compose, su `.env` y su `.env.example`. Se puede levantar, detener y destruir sin tocar nada más.

Lo que parece obvio ahora me tomó varios intentos para definir. La parte difícil no es la estructura, es decidir dónde cortar.

---

## El problema real: las redes

Separar los archivos fue fácil. Lo que no fue fácil fue que los contenedores siguieran hablándose entre sí.

En un solo docker-compose, todos los servicios comparten una red implícita. Cuando los separas en stacks diferentes, cada uno crea su propia red aislada. PostgreSQL en el stack `databases` no puede ver a Portainer en el stack `core`.

La solución que encontré: **redes externas**.

```yaml
# En cada docker-compose.yml
networks:
  homelab:
    external: true
```

El script `deploy.sh` crea las redes antes de levantar cualquier stack:

```bash
docker network create --driver bridge --subnet 172.20.0.0/16 --gateway 172.20.0.1 homelab
docker network create --driver bridge databases
```

| Red         | Para qué                                          |
| ----------- | ------------------------------------------------- |
| `homelab`   | Red general. Todos los servicios se conectan aquí |
| `databases` | Solo para acceso directo a bases de datos         |

Ahora cualquier contenedor resuelve a los demás por nombre: `postgres:5432`, `pihole:80`, `redis:6379`. Docker DNS se encarga. Cero IPs manuales.

Este fue el momento "ajá" del proyecto. Sin redes externas, los stacks separados son inútiles. Con ellas, se comportan como un solo compose pero con independencia operativa.

---

## Un .env por stack: menos es más

Otro aprendizaje que parece menor pero cambió todo: separar las variables de entorno.

Antes tenía un `.env` con 40 variables. Cambiar `REDIS_PASSWORD` me hacía revisar que no hubiera otro servicio usándola. No porque fuera probable, sino porque no podía estar seguro.

Ahora cada stack tiene solo lo que necesita:

```bash
# stacks/core/.env — 6 variables, todas de infraestructura
TZ=America/Bogota
DATA_ROOT=/home/pihomelab/docker/data
PORTAINER_PORT=9000
PORTAINER_SSL_PORT=9443
PIHOLE_WEB_PORT=8080
PIHOLE_PASSWORD=my_password
```

```bash
# stacks/databases/.env — 11 variables, todas de bases de datos
TZ=America/Bogota
DATA_ROOT=/home/pihomelab/docker/data
POSTGRES_PORT=5432
POSTGRES_USER=pihomelab
POSTGRES_PASSWORD=my_password
REDIS_PORT=6379
REDIS_PASSWORD=my_password
# ...
```

El `.env` raíz quedó en dos líneas: subnet y gateway. Nada más.

La ventaja no es solo organizativa. Es cognitiva. Abres el `.env` de un stack y entiendes todo lo que necesita sin ruido.

---

## deploy.sh: un script que me ahorra pensar

No quería recordar el orden correcto, ni las flags, ni qué stacks estaban vacíos. Escribí un script que se encarga:

```bash
./deploy.sh start              # Levanta todos los stacks activos
./deploy.sh start databases    # Solo bases de datos
./deploy.sh stop               # Detiene todo (orden inverso)
./deploy.sh status             # Estado de todo
./deploy.sh logs core          # Logs de un stack específico
```

El orden de arranque importa. Si las bases de datos no están arriba, las apps que dependen de ellas fallan:

```
core → databases → monitoring → apps → media
```

Y se detienen en orden inverso. El script detecta qué stacks tienen servicios reales y salta los placeholders vacíos.

---

## Los servicios que corren hoy

### Core

**Portainer** para ver y gestionar contenedores desde el navegador. **Pi-hole** como DNS para toda la red, bloqueando anuncios antes de que lleguen a cualquier dispositivo.

### Databases

| Motor         | Para qué lo uso              |
| ------------- | ---------------------------- |
| PostgreSQL 15 | Base de datos principal      |
| MySQL 9.4     | Apps legacy que lo necesitan |
| MongoDB 4.4   | Datos no relacionales        |
| Redis 7       | Cache y sesiones             |

Cada motor tiene health checks y límites de memoria. En una Pi con 8GB de RAM, esto no es opcional.

### Apps

**Crafty Controller** para gestionar un servidor de Minecraft.

---

## Automatización: lo que hago una vez y no toco más

### Backups

Un script respalda PostgreSQL, MySQL y MongoDB con retención de 7 días:

```bash
./scripts/backup-databases.sh
```

Dumps comprimidos con gzip. Los viejos se eliminan solos. Lo puse en un cron y me olvidé.

### Health checks

```
=== Core Stack ===
  portainer       OK  (running)
  pihole          OK  (running)

=== Databases Stack ===
  postgres        OK
  redis           OK
  mysql           OK
  mongodb         OK
```

Un vistazo rápido para confirmar que todo respira.

---

## Cuatro cosas que aprendí

**1. El monolito no está roto.** Funciona. Empieza con uno. Pero ten presente que en algún momento vas a necesitar separar, y ese momento llega antes de lo que crees.

**2. Las redes externas son lo que hace posible la separación.** Sin ellas, cada stack es una isla. Con ellas, tienes lo mejor de ambos mundos: aislamiento operativo con comunicación transparente.

**3. Menos variables por archivo = menos errores.** No es solo organización. Es reducir la superficie de cosas que pueden salir mal cuando cambias algo.

**4. Si no documentas mientras construyes, no vas a documentar después.** Cada stack tiene su `.env.example`. Hay docs de la red y los servicios. Mi yo del futuro me lo va a agradecer.

---

## Qué sigue

- **Monitoring** — Prometheus + Grafana para métricas
- **Media** — Jellyfin + la suite \*arr
- **Reverse proxy** — Traefik o Caddy con HTTPS automático
- **Backups remotos** — Enviar dumps a S3

---

## El hardware

Todo esto corre en una **Raspberry Pi 4 de 8GB** con DietPi. Los límites de memoria en cada contenedor no son un nice-to-have, son lo que evita que el OOM killer decida por ti qué servicio muere primero.

Si estás empezando, empieza con el monolito. Cuando empiece a doler, separa. No antes, no después. Justo cuando duela.
