---
title: 'Otto'
description: 'Un dashboard tipo Kanban para gestionar contenedores Docker. Construido con Go y la API de Docker como experimento práctico en herramientas de sistemas.'
date: 2026-02-10
lang: 'es'
translationKey: 'otto'
URL: ''
repoURL: 'https://github.com/cvargas-0/otto'
---

## Arrastra, suelta, despliega.

Una forma visual de gestionar contenedores Docker — porque la terminal es genial, pero a veces solo quieres ver qué está corriendo.

---

## ¿Qué es Otto?

**Otto** es un panel tipo Kanban que se conecta directamente a la API de Docker, permitiéndote visualizar y gestionar tus contenedores con una interfaz drag-and-drop.

En lugar de memorizar `docker ps`, `docker stop` y `docker start`, Otto mapea los estados de los contenedores a columnas en un tablero.

---

## Cómo funciona

- **Columnas Kanban** representan estados del contenedor (corriendo, detenido, pausado)
- **Arrastra un contenedor** entre columnas para cambiar su estado
- **Sincronización en tiempo real** con el daemon de Docker — el tablero refleja lo que está pasando
- **Detalles del contenedor** de un vistazo: imagen, puertos, tiempo activo, uso de recursos

---

## ¿Por qué construir esto?

Dos razones:

1. **Aprender Go de verdad** — No con tutoriales, sino construyendo algo que habla con APIs reales del sistema
2. **Resolver una molestia** — Gestionar contenedores de varios proyectos se vuelve ruidoso en la terminal

---

## Tech stack

- **Go** — API backend y comunicación con el daemon de Docker
- **API de Docker** — Gestión directa del ciclo de vida de contenedores
- **Arquitectura limpia** — Handlers, servicios y capas de repositorio

---

## Estado del proyecto

Experimental. Construido como proyecto de aprendizaje para practicar patrones de Go, diseño de APIs y trabajo con interfaces a nivel de sistema.
