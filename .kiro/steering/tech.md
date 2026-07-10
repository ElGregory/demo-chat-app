# Tech Stack

## Framework & Runtime

- **TanStack Start** — full-stack React framework (do not replace generated architecture)
- **React 19** with **Vite 8** and **Nitro** server
- **TanStack Router** — file-based routing; route tree is auto-generated (`src/routeTree.gen.ts`, never edit manually)
- **TanStack Query** — server state and data fetching
- **TanStack Store** — client state (`new Store(initialState)`, `useStore(store, selector)`)

## AI

- `@tanstack/ai` — core tool definition and chat orchestration (`toolDefinition`, `chat`, `maxIterations`, `toServerSentEventsResponse`)
- `@tanstack/ai-react` — `useChat`, `createChatClientOptions`, `fetchServerSentEvents`
- `@tanstack/ai-client` — `clientTools`
- Provider adapters: `@tanstack/ai-anthropic`, `@tanstack/ai-gemini`, `@tanstack/ai-openai`, `@tanstack/ai-ollama`

## Data

- **Drizzle ORM** + **PostgreSQL** (`pg`) — persistence layer
- Schema lives in `src/db/schema.ts`; migrations output to `./drizzle/`
- **tRPC v11** with superjson transformer — typed API layer (generated integration, reuse don't replace)
- **Zod v4** — schema validation and AI tool input/output contracts

## Styling

- **Tailwind CSS v4** — utility-first CSS
- **shadcn/ui** — component library (`components.json` config present)
- `class-variance-authority`, `clsx`, `tailwind-merge` for variant/class utilities

## Tooling

- **Biome 2.4.5** — linting, formatting, import organization (scope: `src/**/*` only)
- **Vitest** + `@testing-library/react` — testing
- **TypeScript 6** — strict typing throughout

## Path Alias

`#/*` maps to `./src/*` (defined in `package.json` `imports` field). Always use `#/` for internal imports.

## Common Commands

```bash
pnpm dev              # Dev server on :3000
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run tests (vitest run)
pnpm lint             # Biome lint
pnpm format           # Biome format
pnpm check            # Biome check (lint + format)
pnpm generate-routes  # Regenerate TanStack Router route tree
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema directly (dev)
pnpm db:studio        # Open Drizzle Studio
```

## Code Style (Biome)

- Tab indentation
- Double quotes for JS/TS strings
- Biome recommended rules enabled
- Import organization enforced
- `routeTree.gen.ts` and `styles.css` are excluded from Biome

## Environment Variables

```env
DATABASE_URL=...
ANTHROPIC_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

Only one AI provider key is required. `DATABASE_URL` is always required.
