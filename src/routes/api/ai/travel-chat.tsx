import { chat, maxIterations, toServerSentEventsResponse } from "@tanstack/ai"
import { geminiText } from "@tanstack/ai-gemini"
import { anthropicText } from "@tanstack/ai-anthropic"
import { createFileRoute } from "@tanstack/react-router"
import { desc } from "drizzle-orm"
import { db } from "#/db"
import { conversations, travelProfile } from "#/db/schema"
import { extractProfile } from "#/lib/tools/profile-tools"
import { getDestinationInfo } from "#/lib/tools/travel-tools"

const SYSTEM_PROMPT = `You are a friendly travel assistant helping users discover destinations and build their travel profile.

Your GOAL is to help users build a comprehensive travel profile. Ask about and extract:

**Core Profile Fields:**
- budget: "budget", "moderate", or "luxury"
- interests: e.g., ["culture", "food", "nature", "adventure", "shopping"]
- climate: e.g., ["tropical", "temperate", "cold", "mediterranean"]
- activities: e.g., ["hiking", "museums", "beach", "nightlife", "relaxation"]
- dreamDestinations: places they want to visit
- avoidedDestinations: places they want to avoid

**When you gather new information about the user's preferences:**
1. Use the extractProfile tool to update their profile
2. This tool will detect conflicts with existing preferences
3. Report any conflicts to the user and ask them to clarify

**When a user asks about a destination:**
1. Use getDestinationInfo to look up real information
2. Share relevant details about the best seasons to visit, what it is known for, the average daily budgets for budget/mid-range/luxury travelers, and visa requirements
3. Suggest destinations that match their profile

**Response format (MANDATORY):**
You MUST provide user feedback in every response. Use the following structure:

Tool feedback: Describe the action you took (e.g., "I looked up Tokyo for you" or "I've updated your interests").
Profile update:
- List any fields you updated and their new values.
Conflicts:
- Mention any contradictions you found.
Destination:
- Summarize the destination info you retrieved.

Follow this with 1-2 friendly sentences of conversational follow-up and ALWAYS ask a relevant follow-up question to keep the conversation going and build the profile further.

**Conversation Guidelines:**
- Be conversational and friendly.
- If you detect a contradiction (e.g., "I love cold weather" vs earlier saying "I prefer tropical"), ask about it politely.
- Always use the tools when appropriate - don't make up destination info.
- If you don't have enough info for a tool, ask the user for it first.`

async function saveConversation(message: { role: string; content: string }) {
	await db.insert(conversations).values({
		role: message.role,
		content: message.content,
	})
}

async function handler({ request }: { request: Request }) {
	const anthropicKey = process.env.ANTHROPIC_API_KEY
	const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

	if (!anthropicKey && !geminiKey) {
		return new Response("Missing ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY", {
			status: 500,
		})
	}

	// Workaround for @tanstack/ai-gemini requiring GOOGLE_API_KEY implicitly sometimes
	if (geminiKey) {
		process.env.GOOGLE_API_KEY = geminiKey;
	}

	let messages: Array<{ role: string; content: string }>
	try {
		const body = await request.json()
		messages = body.messages ?? []
	} catch (err) {
		console.error("Failed to parse request body:", err)
		return new Response("Invalid JSON body", { status: 400 })
	}

	// Save user messages to DB
	for (const msg of messages) {
		if (msg.role === "user") {
			await saveConversation(msg)
		}
	}

	// Fetch current profile to provide context to the AI
	const profileResult = await db
		.select()
		.from(travelProfile)
		.orderBy(desc(travelProfile.updatedAt))
		.limit(1)

	const currentProfile = profileResult[0]?.preferences ?? {}
	const profileContext = `Current User Profile: ${JSON.stringify(currentProfile, null, 2)}`

	const adapter = anthropicKey
		? anthropicText("claude-3-5-sonnet-latest", { apiKey: anthropicKey })
		: geminiText("gemini-3.1-flash-lite", { apiKey: geminiKey! })

	const stream = chat({
		adapter,
		systemPrompts: [SYSTEM_PROMPT, profileContext],
		messages: messages as any,
		tools: [getDestinationInfo, extractProfile],
		agentLoopStrategy: maxIterations(10),
	})

	const response = toServerSentEventsResponse(stream)
	return new Response(response.body, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	})
}

export const Route = createFileRoute("/api/ai/travel-chat")({
	server: {
		handlers: {
			POST: handler,
		},
	},
})