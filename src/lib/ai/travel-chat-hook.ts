import type { InferChatMessages } from "@tanstack/ai-react";
import {
	createChatClientOptions,
	fetchServerSentEvents,
	useChat,
} from "@tanstack/ai-react";

const chatOptions = createChatClientOptions({
	connection: fetchServerSentEvents("/api/ai/travel-chat"),
});

export type TravelChatMessages = InferChatMessages<typeof chatOptions>;

export const useTravelChat = () => useChat(chatOptions);
