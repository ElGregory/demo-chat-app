<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# AI Project Context

## Project

Profile Builder

## Primary Goal

Build a durable travel profile through conversation.

## Constraints

Do not redesign generated TanStack Start architecture.

Reuse generated integrations whenever possible.

Favor extension over replacement.

Do not over engineer

## Generated Stack

TanStack Start

TanStack Router

TanStack Query

TanStack Store

AI SDK

Drizzle ORM + PostgreSQL

shadcn

Tailwind

Nitro

Biome

## Core Requirements

Streaming chat

Persistent profile

Destination tool

Conflict detection

Typed contracts

## Architecture Principles

Streaming chat and profile extraction are separate operations.

Profile extraction should use structured outputs.

Conflict detection should be deterministic.

Destination tool should be ordinary TypeScript.

Persist everything in PostgreSQL.

## Files to Create

components/chat

components/profile

lib/ai

lib/tools

lib/profile

types

## Avoid

Replacing generated routing

Replacing generated server functions

Introducing Redux

Introducing Zustand

Adding another ORM

Adding another database

Adding Authorization

Changing TanStack conventions

Authentication, accounts, or any notion of multiple users; assume one user.

Real travel data or third-party travel APIs; getDestinationInfo is the only source of truth.

Mobile or responsive polish.

Bookings, payments, sharing, search history, or any feature beyond the core loop.

Test coverage

## Success Criteria

Hello World, Let's Travel!

↓

Create Traveler Profile

↓

Streaming chat

↓

Profile extraction

↓

Conflict detection

↓

Destination tool
