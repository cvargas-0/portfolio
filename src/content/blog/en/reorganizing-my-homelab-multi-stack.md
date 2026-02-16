---
title: "From monolithic docker-compose to multi-stack: reorganizing my homelab"
description: "How I split a single docker-compose.yml into independent stacks with external networks, per-stack .env files, and a deploy script on Raspberry Pi."
date: 2026-02-15
lang: en
translationKey: homelab-multi-stack-restructure
---

![Pi Homelab](/media/reorganizing-my-homelab/pilab.png)

My homelab started the way they all do: a single `docker-compose.yml` with everything inside. Portainer, AdGuard, PostgreSQL, Redis, MySQL, MongoDB... all living in one 180-line file.

It worked. Until it stopped being comfortable.

I wanted to restart databases without killing DNS. I wanted to add a service without reading 180 lines to understand where it fits. I wanted to change the Redis password without wondering if that broke something in Portainer.

It wasn't a technical problem. It was an organization problem. And it took me a while to admit it because _the file worked_.

That's the monolith trap: it doesn't fail, it just hurts a little more each time.

---

## What I tried first (and didn't work)

My first instinct was to split into files and use `docker compose -f core.yml -f databases.yml up`. I quickly learned that Docker Compose treats multiple `-f` files as a merge, not as independent stacks. A `docker compose down` brings them all down.

I needed stacks that were truly independent. Each with its own lifecycle.

---

## The structure I landed on

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
│   ├── monitoring/              # (future) Prometheus, Grafana
│   └── media/                   # (future) Jellyfin, *arr suite
├── scripts/
│   ├── backup-databases.sh
│   └── health-check.sh
├── docs/
├── .env                         # Global network config only
└── deploy.sh                    # Orchestration script
```

Each stack is a directory with its own compose, its own `.env`, and its own `.env.example`. It can be started, stopped, and destroyed without touching anything else.

What seems obvious now took me several iterations to define. The hard part isn't the structure, it's deciding where to cut.

---

## The real problem: networking

Splitting the files was easy. Getting the containers to keep talking to each other was not.

In a single docker-compose, all services share an implicit network. When you separate them into different stacks, each creates its own isolated network. PostgreSQL in the `databases` stack can't see Portainer in the `core` stack.

The solution I found: **external networks**.

```yaml
# In every docker-compose.yml
networks:
  homelab:
    external: true
```

The `deploy.sh` script creates networks before starting any stack:

```bash
docker network create --driver bridge --subnet 172.20.0.0/16 --gateway 172.20.0.1 homelab
docker network create --driver bridge databases
```

| Network     | Purpose                                    |
| ----------- | ------------------------------------------ |
| `homelab`   | General network. All services connect here |
| `databases` | Direct database access only                |

Now any container resolves others by name: `postgres:5432`, `pihole:80`, `redis:6379`. Docker DNS handles it. Zero manual IPs.

This was the "aha" moment of the project. Without external networks, separate stacks are useless. With them, they behave like a single compose but with operational independence.

---

## One .env per stack: less is more

Another lesson that seems minor but changed everything: splitting environment variables.

Before, I had one `.env` with 40 variables. Changing `REDIS_PASSWORD` made me check that no other service was using it. Not because it was likely, but because I couldn't be sure.

Now each stack has only what it needs:

```bash
# stacks/core/.env — 6 variables, all infrastructure
TZ=America/Bogota
DATA_ROOT=/home/pihomelab/docker/data
PORTAINER_PORT=9000
PORTAINER_SSL_PORT=9443
PIHOLE_WEB_PORT=8080
PIHOLE_PASSWORD=my_password
```

```bash
# stacks/databases/.env — 11 variables, all databases
TZ=America/Bogota
DATA_ROOT=/home/pihomelab/docker/data
POSTGRES_PORT=5432
POSTGRES_USER=pihomelab
POSTGRES_PASSWORD=my_password
REDIS_PORT=6379
REDIS_PASSWORD=my_password
# ...
```

The root `.env` shrank to two lines: subnet and gateway. Nothing else.

The benefit isn't just organizational. It's cognitive. You open a stack's `.env` and understand everything it needs without noise.

---

## deploy.sh: a script so I don't have to think

I didn't want to remember the correct order, the flags, or which stacks were empty. I wrote a script that handles it:

```bash
./deploy.sh start              # Start all active stacks
./deploy.sh start databases    # Databases only
./deploy.sh stop               # Stop everything (reverse order)
./deploy.sh status             # Status for everything
./deploy.sh logs core          # Logs for a specific stack
```

Boot order matters. If databases aren't up, apps that depend on them fail:

```
core → databases → monitoring → apps → media
```

Shutdown is reversed. The script detects which stacks have actual services and skips empty placeholders.

---

## What's running today

### Core

**Portainer** to view and manage containers from the browser. **Pi-hole** as DNS for the entire network, blocking ads before they reach any device.

### Databases

| Engine        | What I use it for        |
| ------------- | ------------------------ |
| PostgreSQL 15 | Main database            |
| MySQL 9.4     | Legacy apps that need it |
| MongoDB 4.4   | Non-relational data      |
| Redis 7       | Cache and sessions       |

Each engine has health checks and memory limits. On a Pi with 8GB of RAM, this isn't optional.

### Apps

**Crafty Controller** for managing a Minecraft server.

---

## Automation: set it up once, forget about it

### Backups

A script backs up PostgreSQL, MySQL, and MongoDB with 7-day retention:

```bash
./scripts/backup-databases.sh
```

Gzip-compressed dumps. Old ones get cleaned up automatically. I added it to cron and moved on.

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

A quick glance to confirm everything is breathing.

---

## Four things I learned

**1. The monolith isn't broken.** It works. Start with one. But keep in mind that at some point you'll need to split, and that point arrives sooner than you think.

**2. External networks are what makes the split possible.** Without them, each stack is an island. With them, you get the best of both worlds: operational isolation with transparent communication.

**3. Fewer variables per file = fewer mistakes.** It's not just organization. It's reducing the surface area of things that can go wrong when you change something.

**4. If you don't document while you build, you won't document later.** Each stack has its `.env.example`. There are docs for the network and services. Future me will thank present me.

---

## What's next

- **Monitoring** — Prometheus + Grafana for metrics
- **Media** — Jellyfin + the \*arr suite
- **Reverse proxy** — Traefik or Caddy with automatic HTTPS
- **Remote backups** — Push dumps to S3

---

## The hardware

All of this runs on a **Raspberry Pi 4 8GB** with DietPi. Memory limits on each container aren't a nice-to-have, they're what keeps the OOM killer from deciding which service dies first.

If you're starting out, start with the monolith. When it starts to hurt, split. Not before, not after. Right when it hurts.
