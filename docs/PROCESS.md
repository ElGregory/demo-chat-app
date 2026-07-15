## Your overall approach. Did you plan first, or dive in? Did you let the agent drive, or stay in tight control? Why?

First, I planned fundamental infrastucture, starting with the questions:

- What gets me the closest to feature complete in the least amount of time
- What can I achieve with open source solutions
- What is the truly unique feature in the functionality

Step one was getting a working application to spend 2 hours a feature work. i approached it like this.

Step 1.0 was looking at the requirements from a perspective of Tech Stack and googling the latest on Tanstack Start templates because it offers Server Side Rendering options and is a growing alternative to NextJs. Next is great but it's pretty propietary when it comes to hosting. I've only seen it run on Vercel and I don't want to pay for hosting like that.

Step 1.25 . Was pasting the edited project features into Tanstack Builder to get this from the generated Prompt:

> Start by scaffolding the project with the TanStack CLI.
> Use this command: npx @tanstack/cli@latest create profile --agent --package-manager pnpm --tailwind --add-ons ai,shadcn,store,better-auth,convex,tanstack-query
> If the execution environment starts from an existing platform template or custom starter instead of the TanStack CLI output, still run the TanStack CLI command in a separate scratch directory.
> Then merge the generated integrations, dependencies, config, scripts, and relevant file structure into the actual project instead of skipping the TanStack CLI result.
> Do not drop requested partner integrations or stack choices just because the host platform bootstraps its own template. Represent them in the final project somehow, or explicitly call out what could not be represented and why.
>
> After scaffolding, run npx @tanstack/intent@latest install and npx @tanstack/intent@latest list.
> Use the installed TanStack Intent skills and package-shipped guidance before making architectural or library-specific changes. Do not guess when a shipped skill can tell you the current pattern.
> Keep durable project context in AGENTS.md (or equivalent), including the exact TanStack CLI command used, any follow-up TanStack Intent commands, the chosen stack and integrations, environment variable requirements, deployment notes, key architectural decisions, known gotchas, and next steps.

Instead of running this returned prompt I used it as directions for creating a foundation that was tested, tried and true without wasting any AI credits or generating slop. Ultimately I scrapped the suggested Convex for the Postgres but that came later.

Step 1.5 - Go default hello chat world running with Docker and Drizzle

Step 1.75 Use Kiro prompt:

> Investigate this app. It's built on open source projects but I need help completing the database and ai integrations. I want a functioning basic boilerplate of best practices before I add any features. Currently the application fails on the drizzle route with the following error: Cannot read properties of undefined (reading 'findMany')

Step 1.8 -After getting it working I then removed the unused sample code and updated the readme and agents files to generate the Steering and Spec files to guide future development. Also updated the install instructions. (The Kiro Chat Session is can be found at kiro-session-sess_5dbf94f5-c646-41d4-9644-0847e02191ad.zip)

Step 1.9 Updated all the AGENTS and the readme for hand off to other tools

Step 2 - Switched to copilot to build out the new features using the BYOK feature (Out of Kiro credits),

> Review all the .md files in the codebase and suggest next steps based on where we are in our development. Update the readme if needed. Look at what the stated purpose/goal of the project and determine what is left to meet the requirements.

Step 3 - Reviewed what was built and update the documentation

Step 4 - Updated process doc and gather chats

## What you reviewed by hand vs. trusted. Where did you read every line? Where did you skim? Where (honestly) did you ship something you didn't fully verify?

I didn't spend a lot of time thinking about the profile or destination details knowing they would be discussed later. I thought the important part was to get something basic working as a point of discussion and adjust based on feedback.

Most of my time was spent reading the docs of each of the technologies in the stack. I wanted to be comfortable, if not eager, to support the technologies chosen. I also wanted to choose tech that wouldn't cost anyone at scale so I used the webkitSpeechRecognition api instead of option for a voice api. If I were to continue building I would next implement a free/cheap TTS api to make the chat bot respond audibly to the users' input because the savings is dramatic. A lot of things were rushed due to time constraints but it was all done with the knowledge that it was meant to be viewed as a work in progress.

One of my concerns was that I didn't treat the destination tool the way the directions suggested. Here is the prompt a sent as I was checking for completenes:

> Here is the orginal request. I think we are missing something important about the getDestinationInfo. Make a plan to fill any gaps, we will then need to document our assumptions in a new markdown file. We want to be able to support the application and we want future agents to understand the why and the what.
>
> The original Requirements Doc:
>
> # The Task
>
> Build a single-page web app called **Profile Builder** that helps a traveler create a durable "travel profile" through conversation.
>
> **The shape of it:**
>
> - A chat interface where the user talks to the assistant about their travel preferences.
> - As the conversation progresses, the assistant extracts structured fields and builds a profile.
> - A read-only view in the UI that lists the current travel preferences. Side panel, section below the chat, separate page — your call on placement, but it should be part of the app, not a debug route.
> - The profile persists across reloads.
>
> ## Must have
>
> - A working chat UI with **streamed** assistant responses (tokens appear as they arrive).
> - The assistant extracts structured profile data from the conversation. Pick your approach: tool/function calling, structured outputs, JSON mode, a second extraction call, whatever you can defend.
> - The profile persists (SQLite, a JSON file, Vercel KV, Postgres, or any other) and survives a page reload.
> - A read-only view in the UI that lists the current travel preferences. Placement is your call (panel, section, separate page), but it has to be part of the app.
> - A typed contract between client and server. We should be able to read your API and know what's flowing.
> - **A destination tool your app calls.** Whenever the conversation references a specific destination, the app must call `getDestinationInfo` and use the result to ask informed follow-up questions. Contract example below.
> - **Conflict detection.** When new conversation contradicts an already-extracted profile field (e.g., the user said "vegetarian" earlier, now mentions a steakhouse), the agent must surface the contradiction rather than silently overwriting. _How_ you surface it — ask the user, flag it in the UI, propose a resolution — is your call.
> - A `README.md` that gets us running in under 5 minutes and walks us through your decisions.
>
> ## The destination tool
>
> You'll implement this in your codebase; it's a stand-in for what would be a real travel data API.
>
> ```
> async function getDestinationInfo(name: string): Promise<DestinationInfo | null>
>
> type DestinationInfo = {
>   name: string;
>   bestSeasons: Array<'spring' | 'summer' | 'fall' | 'winter'>;
>   knownFor: string[]; // e.g., ["food", "architecture", "hiking"]
>   averageDailyBudgetUSD: { budget: number; midRange: number; luxury: number };
>   visaNotes?: string;
> };
> ```
>
> Hardcode data for at least 5 destinations of your choosing. Return `null` for unknown destinations — and make sure your agent does something sensible with that case rather than hallucinating. Feel free to extend the schema if it makes the conversation richer; just keep the function name and the existing fields.
>
> Native LLM tool-calling is welcome but not required. An explicit orchestration step (detect the destination in app code, call the function, inject the result back into the prompt) is also fine if you can defend it.
>
> ## Nice to have (only if you have time)
>
> - Structured logs for LLM calls and tool calls (model, latency, token counts, request IDs). JSON to stdout is fine.
> - Live updates to the profile view as the conversation progresses (vs. only after the turn completes).
> - Handling for the assistant changing its mind or correcting earlier extractions.

Treating the getDestinationInfo as an external function the internat tool should call was the right approach.

## What you'd do differently next time.

I should have looked at the details sooner so the 2 hours of coding could start sooner ;-). This wasn't something you set aside two hours for. Most of my time was spent understanding the ask and planning the approach, once the foundation was built it seemed to go fast.

My first approach was to use the db suggested in the Tanstack docs, Convex, as a database/backend. I started using it and really loved the simplicity and tooling but after researching what it would take to deploy I thought again. For this project I chose the one I would want to scale with if it was my time and money on the line. It may have made more sense to use local storage for the chat history. Having the fullstack plumbing working from the beginning is great assuming we need that stack, if it isn't the direction intended it was a waste of effort.

I also would have used feature branches for you to see the check-ins more clearly. The Trunk Strategy buries changes in the commit history where as using feature branches gives everyone a clear view of what changed with each merge.

I used reorganizing the documentation as an excuse to demontrate using feature branches.

## If this had to run at scale. What would you change about model choice, prompting, schema, or eval strategy if this were serving 10k requests an hour? Don't implement it, just sketch your thinking.

To handle 10k requests an hour, I would consider the following suggestions from the agent:

1. **Model Choice**: Move from larger general-purpose models to a more specialized or smaller, faster model (like Gemini Flash or Claude Haiku) for the chat interface to reduce latency and cost.
2. **Architecture**: Decouple the profile extraction from the chat loop entirely. The chat could stream responses immediately, while a background job processes the conversation history asynchronously to extract profile updates and detect conflicts.
3. **Prompting**: Refine the system prompts to be shorter and more structured, relying heavily on function calling with strict JSON schemas to reduce token usage and improve reliability.
4. **Data Schema & Caching**: Introduce a caching layer (like Redis) for the user profile and frequent destination queries to avoid hitting PostgreSQL on every request. Vector search could also be used for destination recommendations instead of static queries.
5. **Eval Strategy**: Implement an evaluation pipeline using LLM-as-a-judge (or a framework like LangSmith/Braintrust) to continuously test the accuracy of profile extraction and conflict detection against a golden dataset of user conversations.

In the real world I would have asked some questions before making the decisions I did but you have to start somewhere.
