import { chat, maxIterations, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { getDestinationInfo } from "#/lib/tools/travel-tools";

const SYSTEM_PROMPT = `You are a friendly travel assistant helping users discover destinations and build their travel profile.

You have access to a getDestinationInfo tool to look up real information about destinations.
Always use the tool when a user asks about a specific destination — never make up details.

When chatting:
- Ask about travel preferences (climate, budget, activities, cuisine)
- Use destination info to make personalised suggestions
- Be concise and conversational
- If a destination isn't in the database, say so honestly`;

async function handler({ request }: { request: Request }) {
	const { messages } = await request.json();

	const stream = chat({
		adapter: geminiText("gemini-2.5-flash", {
			apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		}),
		systemPrompts: [SYSTEM_PROMPT],
		messages,
		tools: [getDestinationInfo],
		agentLoopStrategy: maxIterations(5),
	});

	return toServerSentEventsResponse(stream);
}

export const Route = createFileRoute("/api/ai/travel-chat")({
	server: {
		handlers: {
			POST: handler,
		},
	},
});
