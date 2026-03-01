---
title: 'Project S'
description: 'A 2D roguelike survivor game built with PixiJS and TypeScript. Wave-based combat, dynamic events, and upgrade systems inspired by Vampire Survivors.'
date: 2026-02-15
lang: 'en'
translationKey: 'project-s'
URL: ''
repoURL: 'https://github.com/cvargas-0/project-s'
---

## Survive. Level up. Repeat.

A roguelike survivor where every run tells a different story — built from scratch with PixiJS v8 and TypeScript.

---

## What is Project S?

**Project S** is a 2D survivor game inspired by Vampire Survivors. You control a character in a 3000x3000 pixel world, fighting waves of enemies, collecting XP, and choosing upgrades that shape each run.

No two sessions play the same.

---

## Core mechanics

- **Auto-attack combat** — Projectile lifecycle, spatial collision, and composable screen shake
- **Dynamic events** — Swarm, Berserker, Frost, and Blood Moon alter gameplay every 60–90 seconds
- **Wave patterns** — Encirclement, Rush, and Elite Squad keep you on your toes
- **20 upgrades across 4 rarity tiers** — Some come with trade-offs, forcing real decisions

---

## Under the hood

Performance matters when hundreds of entities share the screen:

- **Object pooling** for enemies and projectiles — zero garbage collection pressure
- **Spatial grid partitioning** (64px cells) — collision detection drops from O(P*E) to O(P*k)
- **Lerp camera** with world-bound clamping for smooth following
- **60fps game loop** with frame-based movement and millisecond timers

---

## Tech stack

- **PixiJS v8** — Fast 2D WebGL rendering
- **TypeScript** — Type safety across the entire codebase
- **Composable architecture** — World container separated from static UI layer

---

## Project purpose

An experiment in game development patterns: entity pooling, spatial partitioning, state machines, and real-time physics. Built to push the limits of browser-based 2D games.
