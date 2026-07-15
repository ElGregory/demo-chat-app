# TanStack AI SDK - Developer & Integration Guide

This guide details how the **Profile Builder** utilizes the `@tanstack/ai` SDK for type-safe tooling, multi-turn agent loops, and efficient stream orchestration. It is designed to help human developers and future AI agents/chatbots understand, maintain, and extend the AI capabilities of this application.

---

## 1. Architectural Philosophy: The "Smart Tools, Dumb Model" Pattern

Our system employs a deliberate architectural pattern: **the intelligence lies in the code (the tools), not in an expensive LLM reasoning engines.**

### Why Use the Cheapest, Dumbest Model Available?

1. **Fully Deterministic Logic**: All heavy lifting—such as verifying inputs, evaluating existing traveler preferences, performing database transactions, and running complex conflict-detection rules—happens inside standard TypeScript functions executed on our server.
2. **Minimal LLM Responsibilities**: The LLM has only three simple jobs:
   - Recognize the user's intent (e.g., "I want to visit Tokyo" or "I prefer budget travel").
   - Extract raw parameters to match our defined Zod schema (e.g., `destination: "Tokyo"`).
   - Summarize the structured tool outputs back into a friendly, conversational message.
3. **Speed & Economics**: By restricting the LLM's role to basic routing and synthesis, we can use incredibly cheap and ultra-fast models like **Gemini 3.1 Flash Lite**, **GPT-4o-mini** or older or self-hosted. You get near-instant streaming and rock-bottom API costs without sacrificing reliability.
4. **Resiliency**: If a model makes a poor inference, our Zod validations catch it immediately, preventing corrupt data from ever touching our PostgreSQL database.
5. **Best tools for the job**: The ability to swap model allows you to choose the best tools for the job at hand. The ability to choose a better model is always there later. Sometimes it's forced on you like the deprecation of **Gemini 2** models.

---

## 2. Codebase Map: What Handles What

**To work on the AI conversational loop, you need to understand where things live:**

```
src/
├── db/schema.ts                       # Database schemas (conversations, travelProfile, conflicts)
├── lib/
│   ├── services/
│   │   └── destinationService.ts      # Static/mock data source for destination facts
│   └── tools/
│       ├── travel-tools.ts            # getDestinationInfo tool definition & handler
│       └── profile-tools.ts           # extractProfile tool definition & conflict detection handler
└── routes/
    └── api/
        └── ai/
            └── travel-chat.tsx        # Endpoint: orchestrates the agent loop, adapter config, SSE stream
```

---

## 3. How Tool Definitions & Execution Works

The `@tanstack/ai` SDK splits tools into two parts:

1. **The Declaration (`toolDefinition`)**: Defines the schema and metadata shared with the LLM.
2. **The Server Implementation (`.server()`)**: The actual TypeScript function that runs on the server when the model decides to call that tool.

### A. Anatomical Example of a Tool

**Here is how `getDestinationInfo` is implemented inside `src/lib/tools/travel-tools.ts`:**

```typescript
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { getDestinationInfo as getDestinationFromService } from "../services/destinationService";

// 1. Declare the schema & capabilities of the tool
export const getDestinationInfoToolDef = toolDefinition({
  name: "getDestinationInfo",
  description: "Look up structured information about a travel destination...",
  inputSchema: z.object({
    destination: z
      .string()
      .describe("Name of the city or destination to look up"),
  }),
  outputSchema: z.union([
    destinationInfoSchema,
    z.object({ error: z.string() }),
  ]),
});

// 2. Bind the server execution logic
export const getDestinationInfo = getDestinationInfoToolDef.server(
  async ({ destination }) => {
    // This runs securely on your server
    const info = await getDestinationFromService(destination);
    if (!info) {
      return { error: `No information found for "${destination}".` };
    }
    return info;
  },
);
```

### B. Integrating/Registering Tools in the Chat Loop

In the backend router (`src/routes/api/ai/travel-chat.tsx`), tools are registered directly inside the `chat` configuration. The SDK automatically manages the back-and-forth execution of these tools up to a safe limit (`maxIterations`):

```typescript
import { chat, maxIterations, toServerSentEventsResponse } from "@tanstack/ai";
import { extractProfile } from "#/lib/tools/profile-tools";
import { getDestinationInfo } from "#/lib/tools/travel-tools";

const stream = chat({
  adapter, // e.g., Gemini or Anthropic provider
  systemPrompts: [SYSTEM_PROMPT, profileContext],
  messages,
  tools: [getDestinationInfo, extractProfile], // Register tools here
  agentLoopStrategy: maxIterations(10), // Multi-turn tool loops handled natively!
});

return toServerSentEventsResponse(stream);
```

---

## 4. Currently Available Tools

The following tools are already active in the conversational loop and can be used as references:

### 1. `getDestinationInfo`

- **Location**: `src/lib/tools/travel-tools.ts`
- **Purpose**: Fetches structured facts (best seasons, average daily budgets, what it's known for, visa notes) from the isolated `destinationService`.
- **Key Learning**: Demonstrates how to delegate queries to internal standalone services to decouple the AI logic from our database.

### 2. `extractProfile`

- **Location**: `src/lib/tools/profile-tools.ts`
- **Purpose**: Dynamically parses preferences from user statements and saves them to the PostgreSQL database.
- **Key Learning**: Integrates server-side logic directly inside the tool callback to compare incoming preferences against the traveler's existing profile in PostgreSQL, logging unresolved contradictions directly into the `conflicts` table.

---

## 5. Guide for Future Chatbots & AI Agents

If you are an AI assistant or chatbot tasked with modifying this codebase, follow these rules:

1. **Keep Tools Deterministic**: Never let the LLM execute unstructured actions. If you need to build a new feature (e.g., "add travel companion preferences"), write a structured tool using Zod validation and a deterministic server helper.
2. **Reuse Existing Adapters**: Do not change the endpoint logic to use highly complex/expensive model reasoning unless explicitly asked. The system is designed to run efficiently on Gemini Flash / GPT-3.5-tier models.
3. **Register New Tools**: If you write a new tool in `src/lib/tools/`, make sure you:
   - Import it in `src/routes/api/ai/travel-chat.tsx`.
   - Pass it into the `tools: [...]` array of the `chat` orchestrator.
   - Update the `SYSTEM_PROMPT` inside `travel-chat.tsx` to instruct the model when and how to invoke your new tool.

## 6. Travel Chat Prompt

The system prompt is tailored to a sample profile schema and uses a mock getDestinationInfo. Update the prompt when you learn more about the actual getDestinationInfo and know what profile info is important to capture.

> You are a friendly travel assistant helping users discover destinations and build their travel profile.
>
> Your GOAL is to help users build a comprehensive travel profile. Ask about and extract:
>
> **Core Profile Fields:**
>
> - budget: "budget", "moderate", or "luxury"
> - interests: e.g., ["culture", "food", "nature", "adventure", "shopping"]
> - climate: e.g., ["tropical", "temperate", "cold", "mediterranean"]
> - activities: e.g., ["hiking", "museums", "beach", "nightlife", "relaxation"]
> - dreamDestinations: places they want to visit
> - avoidedDestinations: places they want to avoid
>
> **When you gather new information about the user's preferences:**
>
> 1. Use the extractProfile tool to update their profile
> 2. This tool will detect conflicts with existing preferences
> 3. Report any conflicts to the user and ask them to clarify
>
> **When a user asks about a destination:**
>
> 1. Use getDestinationInfo to look up real information
> 2. Share relevant details about the best seasons to visit, what it is known for, the average daily budgets for budget/mid-range/luxury travelers, and visa requirements
> 3. Suggest destinations that match their profile
>
> **Response format (MANDATORY):**
> You MUST provide user feedback in every response. Use the following structure:
>
> Tool feedback: Describe the action you took (e.g., "I looked up Tokyo for you" or "I've updated your interests").
> Profile update:
>
> - List any fields you updated and their new values.
>   Conflicts:
> - Mention any contradictions you found.
>   Destination:
> - Summarize the destination info you retrieved.
>
> Follow this with 1-2 friendly sentences of conversational follow-up and ALWAYS ask a relevant follow-up question to keep the conversation going and build the profile further.
>
> **Conversation Guidelines:**
>
> - Be conversational and friendly.
> - If you detect a contradiction (e.g., "I love cold weather" vs earlier saying "I prefer tropical"), ask about it politely.
> - Always use the tools when appropriate - don't make up destination info.
> - If you don't have enough info for a tool, ask the user for it first.`
