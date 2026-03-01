---
title: 'Project S'
description: 'Un juego roguelike survivor 2D construido con PixiJS y TypeScript. Combate por oleadas, eventos dinámicos y sistema de mejoras inspirado en Vampire Survivors.'
date: 2026-02-15
lang: 'es'
translationKey: 'project-s'
URL: ''
repoURL: 'https://github.com/cvargas-0/project-s'
---

## Sobrevive. Sube de nivel. Repite.

Un roguelike survivor donde cada partida cuenta una historia diferente — construido desde cero con PixiJS v8 y TypeScript.

---

## ¿Qué es Project S?

**Project S** es un juego survivor 2D inspirado en Vampire Survivors. Controlas un personaje en un mundo de 3000x3000 píxeles, enfrentando oleadas de enemigos, recolectando XP y eligiendo mejoras que definen cada partida.

Ninguna sesión se juega igual.

---

## Mecánicas principales

- **Combate auto-attack** — Ciclo de vida de proyectiles, colisiones espaciales y screen shake composable
- **Eventos dinámicos** — Swarm, Berserker, Frost y Blood Moon alteran la jugabilidad cada 60–90 segundos
- **Patrones de oleadas** — Encirclement, Rush y Elite Squad mantienen la tensión
- **20 mejoras en 4 niveles de rareza** — Algunas con trade-offs que fuerzan decisiones reales

---

## Bajo el capó

El rendimiento importa cuando cientos de entidades comparten la pantalla:

- **Object pooling** para enemigos y proyectiles — cero presión en el garbage collector
- **Particionamiento espacial** (celdas de 64px) — la detección de colisiones baja de O(P*E) a O(P*k)
- **Cámara lerp** con clamping al mundo para un seguimiento suave
- **Game loop a 60fps** con movimiento basado en frames y timers en milisegundos

---

## Tech stack

- **PixiJS v8** — Renderizado 2D WebGL rápido
- **TypeScript** — Tipado seguro en todo el codebase
- **Arquitectura composable** — Contenedor del mundo separado de la capa UI estática

---

## Propósito del proyecto

Un experimento en patrones de desarrollo de juegos: entity pooling, particionamiento espacial, máquinas de estado y física en tiempo real. Construido para explorar los límites de los juegos 2D en el navegador.
