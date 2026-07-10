import { chat, maxIterations, toServerSentEventsResponse } from "@tanstack/ai"
import { geminiText } from "@tanstack/ai-gemini"
import { createFileRoute } from "@tanstack/react-router"
import { db } from "#/db"
import { conversations } from "#/db/schema"
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
2. Share relevant details about attractions, climate, budget, cuisine
3. Suggest destinations that match their profile

**Conversation Guidelines:**
- Be conversational and friendly
- Ask follow-up questions to gather profile details
- If you detect a contradiction (e.g., "I love cold weather" vs earlier saying "I prefer tropical"), ask about it
- Always use the tools when appropriate - don't make up destination info`

async function saveConversation(message: { role: string; content: string }) {
	await db.insert(conversations).values({
		role: message.role,
		content: message.content,
	})
}

async function handler({ request }: { request: Request }) {
	if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
		return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY", {
			status: 500,
		})
	}

	let messages: Array<{ role: string; content: string }>
	try {
		const body = await request.json()
		messages = body.messages ?? []
	} catch {
		return new Response("Invalid JSON body", { status: 400 })
	}

	// Save user messages to DB
	for (const msg of messages) {
		if (msg.role === "user") {
			await saveConversation(msg)
		}
	}

	const stream = chat({
		adapter: geminiText("gemini-2.5-flash", {
			apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		}),
		systemPrompts: [SYSTEM_PROMPT],
		messages: messages as any,
		tools: [getDestinationInfo, extractProfile],
		agentLoopStrategy: maxIterations(10),
	})

	const response = toServerSentEventsResponse(stream)
	return new Response(response as any, {
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