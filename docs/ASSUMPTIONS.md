# Profile Builder - Design Decisions & Assumptions

This document describes the architectural design decisions, data contracts, and implementation choices behind **Profile Builder** to help future developers and AI agents understand the "why" and "what" of our system.

---

## 1. The Core Loop & Stated Purpose

The goal of this application is to construct a **durable, persistent travel profile** for a single traveler through conversational AI.

1. The user chats naturally with a streaming assistant.
2. The system dynamically extracts structure preferences (budget, interests, climate, activities, dream/avoided destinations) using the `extractProfile` tool.
3. If new statements contradict the existing profile, a conflict is deterministically detected, saved to the database, and surfaced in the UI for manual resolution.
4. When a user asks about a destination, the dedicated destination service (`src/lib/services/destinationService.ts`) is queried to retrieve structured facts (such as seasons, costs, highlights, and visa notes) which the AI uses to guide follow-up questions.

---

## 2. Key Architecture Decisions

### A. Dedicated Destination Service (`destinationService.ts`)

- **Separation of Concerns**: Rather than coupling destination data directly to our primary transaction/profile database, we designed the destination lookup as a **completely standalone service**.
- **The "Why"**:
  1. This models a real-world architecture where travel metadata/API access runs on its own isolated server or third-party service, distinct from our local user profiles and chat threads.
  2. Allows us to easily swap out mock data with actual production travel APIs (e.g., Sabre, Amadeus, or TripAdvisor) down the road without rewriting any schema or database tables.
- **Contract Enforcement**: The service strictly exposes the typed contract defined in the initial assignment.

### B. Deterministic Conflict Detection

- **Approach**: Conflict detection runs inside the `extractProfile` server-side tool execution, not purely inside the LLM prompt.
- **Mechanism**: When the AI attempts to extract a new profile field value, the `detectConflict` helper compares it with the database's existing value.
  - For array-like fields (e.g., `interests`), adding items is considered an update. However, removing an item or expressing a strong dislike (e.g., putting a previously favored destination into `avoidedDestinations`) registers as a contradiction.
  - For scalar values (like `budget`), any mismatch (e.g., switching from `luxury` to `budget`) triggers a formal conflict.
- **UI-Driven Resolution**: When a conflict is detected:
  1. It is stored in the `conflicts` table as `resolved: false`.
  2. The UI (`ProfileView.tsx`) reads pending conflicts and renders a high-contrast card with three distinct resolution paths: **"Keep Previous"**, **"Accept New"**, or **"Merge Both"** (for list structures).
  3. This ensures the user has absolute, explicit control over their travel profile.

### C. Persistent Framework (Drizzle + PostgreSQL)

- **Framework**: TanStack Start handles layout and full-stack routing, and tRPC v11 handles typed contracts between the React client and the backend.
- **Why PostgreSQL**: Everything related to our core application state (conversation history, user travel profile, and logged conflicts) is durably stored in local PostgreSQL.

### D. AI Tooling & Orchestration (TanStack AI SDK)

We use the `@tanstack/ai` suite for type-safe tooling, multi-turn agent loops, and efficient stream orchestration. Because our tooling relies on a **"Smart Tools, Dumb Model"** paradigm, all complexity (such as conflict detection, structured validation, and service integration) is handled deterministically on our server. This allows us to use the cheapest, fastest models available (like Gemini 3.1 Flash Lite) while keeping operations ultra-reliable and cost-efficient.

Detailed learnings, codebase mapping, tool definitions, and integration guidelines have been moved to their own dedicated document: **[`AI-DEVELOPER-GUIDE.md`](./AI-DEVELOPER-GUIDE.md)**.

---

## 3. Data Contracts

### Destination Info Schema (`destinationService.ts`)

```typescript
export type DestinationInfo = {
  name: string;
  bestSeasons: Array<"spring" | "summer" | "fall" | "winter">;
  knownFor: string[]; // e.g., ["food", "architecture", "hiking"]
  averageDailyBudgetUSD: { budget: number; midRange: number; luxury: number };
  visaNotes?: string;
};
```

---

## 4. Guide for Future Developers & AI Agents

### Modifying Destination Data

If you need to add or update destinations, simply add or update entries in the database structure inside `src/lib/services/destinationService.ts`. No database migrations or schema alterations are required.

To sync the local database cache table (which can be used for secondary reporting or background syncs):

1. Run `pnpm db:seed` to update the local destinations table from the service's static list.

### Adjusting Extraction Logic

The system prompt in `src/routes/api/ai/travel-chat.tsx` gives the assistant strict directives on how and when to call tools. If you introduce more fields to the traveler's profile (e.g., dietary preferences or travel companions):

1. Update `ProfileInputSchema` in `src/lib/tools/profile-tools.ts`.
2. Update the `travelProfile` table columns if necessary (though since `preferences` is stored as a loose `json()` column in Drizzle, you can insert new keys directly without migrating schemas).
3. Update the `ProfileView.tsx` rendering logic to include editable tags for your new fields.
