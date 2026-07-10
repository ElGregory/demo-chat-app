import { BotIcon, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import type { TravelChatMessages } from "#/lib/ai/travel-chat-hook";
import { useTravelChat } from "#/lib/ai/travel-chat-hook";

function Messages({ messages }: { messages: TravelChatMessages }) {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (!messages.length) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 text-[var(--sea-ink-soft)]">
				<BotIcon size={36} className="opacity-40" />
				<p className="text-sm">
					Ask me about destinations, travel tips, or tell me where you want to
					go!
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-1 overflow-y-auto py-4">
			{messages.map(({ id, role, parts }) => (
				<div
					key={id}
					className={`flex gap-3 px-4 py-2 ${role === "assistant" ? "bg-[var(--chip-bg)]" : ""}`}
				>
					<div
						className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${
							role === "assistant"
								? "bg-[var(--lagoon-deep)]"
								: "bg-[var(--sea-ink-soft)]"
						}`}
					>
						{role === "assistant" ? "AI" : "Y"}
					</div>
					<div className="min-w-0 flex-1 text-sm text-[var(--sea-ink)]">
						{parts.map((part, i) => {
							if (part.type === "text" && part.content) {
								return <Streamdown key={i}>{part.content}</Streamdown>;
							}
							return null;
						})}
					</div>
				</div>
			))}
			<div ref={bottomRef} />
		</div>
	);
}

export default function TravelChat() {
	const { messages, sendMessage } = useTravelChat();
	const [input, setInput] = useState("");

	const submit = () => {
		const text = input.trim();
		if (!text) return;
		sendMessage(text);
		setInput("");
	};

	return (
		<div className="island-shell flex h-[600px] flex-col overflow-hidden rounded-2xl">
			{/* Header */}
			<div className="flex items-center gap-2 border-b border-[var(--line)] px-5 py-4">
				<BotIcon size={20} className="text-[var(--lagoon-deep)]" />
				<h2 className="text-base font-semibold text-[var(--sea-ink)]">
					Travel Assistant
				</h2>
			</div>

			{/* Messages */}
			<Messages messages={messages} />

			{/* Input */}
			<div className="border-t border-[var(--line)] px-4 py-3">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
					className="relative"
				>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								submit();
							}
						}}
						placeholder="Where do you want to go?"
						className="demo-textarea w-full resize-none pr-12 text-sm"
						rows={1}
						style={{ minHeight: "40px", maxHeight: "120px" }}
						onInput={(e) => {
							const el = e.target as HTMLTextAreaElement;
							el.style.height = "auto";
							el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
						}}
					/>
					<button
						type="submit"
						disabled={!input.trim()}
						className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)] disabled:opacity-30"
					>
						<Send size={16} />
					</button>
				</form>
			</div>
		</div>
	);
}
