---
title: 'Otto'
description: 'A Kanban-style dashboard for managing Docker containers. Built with Go and the Docker API as a hands-on experiment in systems tooling.'
date: 2026-02-10
lang: 'en'
translationKey: 'otto'
URL: ''
repoURL: 'https://github.com/cvargas-0/otto'
---

## Drag, drop, deploy.

A visual way to manage Docker containers — because terminals are great, but sometimes you just want to see what's running.

---

## What is Otto?

**Otto** is a Kanban-style panel that connects directly to the Docker API, letting you visualize and manage your containers through a drag-and-drop interface.

Instead of memorizing `docker ps`, `docker stop`, and `docker start`, Otto maps container states to columns on a board.

---

## How it works

- **Kanban columns** represent container states (running, stopped, paused)
- **Drag a container** between columns to change its state
- **Real-time sync** with the Docker daemon — the board reflects what's actually happening
- **Container details** at a glance: image, ports, uptime, resource usage

---

## Why build this?

Two reasons:

1. **Learn Go properly** — Not through tutorials, but by building something that talks to real system APIs
2. **Scratch an itch** — Managing containers across multiple projects gets noisy in the terminal

---

## Tech stack

- **Go** — Backend API and Docker daemon communication
- **Docker API** — Direct container lifecycle management
- **Clean architecture** — Handlers, services, and repository layers

---

## Project status

Experimental. Built as a learning project to practice Go patterns, API design, and working with system-level interfaces.
