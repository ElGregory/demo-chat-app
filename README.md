# Profile Builder

A desktop-first AI travel assistant that builds a durable travel profile through natural conversation.

---

## Prerequisites

- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`
- [Docker](https://docs.docker.com/get-docker/)
- A Google Gemini API key — [get one free](https://aistudio.google.com/app/apikey)

---

## Quick Start (Under 5 minutes)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example and fill in your Gemini key:

```bash
cp .env.local.example .env.local
```

`.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/profile_builder
```

### 3. Start the database

```bash
docker-compose up -d postgres
```

### 4. Apply migrations and seed destinations

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Design Decisions

Curious about how we decouple the destination API or how conflict detection runs? We documented our logic and assumptions:

- **[Architecture & Assumptions](./ASSUMPTIONS.md)** — Explains the separated `DestinationService`, Postgres setup, and deterministic conflict detection.
- **[Process & Scaling](./PROCESS.md)** — Covers how the project was built and how it scales.

---

## What you'll see

| Route           | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `/`             | Home page with the AI travel chat                            |
| `/profile`      | Your persistent travel profile and conflict resolution       |
| `/destinations` | All available destinations from the mock destination service |

Chat with the assistant — it can look up any of the 8 seeded destinations, answer questions about best seasons to visit, daily costs, local highlights, visa rules, and more, while seamlessly building your persistent travel profile.

---

## AI Providers

Supported providers (only one key required):

| Provider         | Env var                        |
| ---------------- | ------------------------------ |
| Google Gemini    | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Anthropic Claude | `ANTHROPIC_API_KEY`            |

---

## Common commands

```bash
pnpm dev           # Start dev server on :3000
pnpm build         # Production build
pnpm db:migrate    # Apply database migrations
pnpm db:seed       # Seed destination data
pnpm db:studio     # Open Drizzle Studio (database browser)
pnpm lint          # Lint with Biome
pnpm check         # Lint + format check
```

---

## Tech stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [TanStack Router](https://tanstack.com/router) — file-based routing
- [TanStack Query](https://tanstack.com/query) — server state
- [@tanstack/ai](https://tanstack.com/ai) + Google Gemini — streaming AI chat
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL — persistence
- [tRPC](https://trpc.io) — typed API layer
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) — styling
