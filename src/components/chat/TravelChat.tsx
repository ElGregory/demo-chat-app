import { BotIcon, MicIcon, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { parseChatSummary } from "#/lib/ai/chat-summary";
import type { TravelChatMessages } from "#/lib/ai/travel-chat-hook";
import { useTravelChat } from "#/lib/ai/travel-chat-hook";

type SpeechRecognitionLike = {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
	onerror: ((event: { error: string }) => void) | null;
	onend: (() => void) | null;
	onstart: (() => void) | null;
	start: () => void;
	stop: () => void;
};

declare global {
	interface Window {
		SpeechRecognition?: new () => SpeechRecognitionLike;
		webkitSpeechRecognition?: new () => SpeechRecognitionLike;
	}
}

function Messages({
	messages,
	isLoading,
}: {
	messages: TravelChatMessages;
	isLoading: boolean;
}) {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (!messages.length && !isLoading) {
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
							if (part.type === "tool-call") {
								return (
									<div
										key={i}
										className="mb-2 flex items-center gap-2 rounded-lg bg-white/50 px-3 py-1.5 text-[10px] font-medium text-[var(--lagoon-deep)] shadow-sm"
									>
										<span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--lagoon-deep)]" />
										Working: {part.name}...
									</div>
								);
							}

							if (part.type !== "text" || !part.content) {
								return null;
							}

							const summary = parseChatSummary(part.content);

							return (
								<div key={i} className="space-y-2">
									<Streamdown>{part.content}</Streamdown>
									{summary.hasStructuredInfo && (
										<div className="space-y-2 rounded-xl border border-[var(--line)] bg-white/70 p-3 text-xs">
											{summary.toolFeedback && (
												<div className="rounded-lg bg-[var(--chip-bg)] p-2">
													<p className="mb-1 font-semibold uppercase tracking-wide text-[var(--lagoon-deep)]">
														Tool feedback
													</p>
													<p>{summary.toolFeedback}</p>
												</div>
											)}
											{summary.profileUpdate.length > 0 && (
												<div className="rounded-lg border border-[var(--line)] p-2">
													<p className="mb-1 font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
														Profile update
													</p>
													<ul className="list-disc space-y-1 pl-4">
														{summary.profileUpdate.map((item) => (
															<li key={item}>{item}</li>
														))}
													</ul>
												</div>
											)}
											{summary.conflicts.length > 0 && (
												<div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700">
													<p className="mb-1 font-semibold uppercase tracking-wide">
														Conflicts
													</p>
													<ul className="list-disc space-y-1 pl-4">
														{summary.conflicts.map((item) => (
															<li key={item}>{item}</li>
														))}
													</ul>
												</div>
											)}
											{summary.destination.length > 0 && (
												<div className="rounded-lg border border-[var(--line)] p-2">
													<p className="mb-1 font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
														Destination
													</p>
													<ul className="list-disc space-y-1 pl-4">
														{summary.destination.map((item) => (
															<li key={item}>{item}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			))}
			{isLoading && (
				<div className="flex gap-3 px-4 py-2">
					<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--lagoon-deep)] text-xs font-bold text-white">
						AI
					</div>
					<div className="flex items-center gap-1">
						<span
							className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--sea-ink-soft)]"
							style={{ animationDelay: "0ms" }}
						/>
						<span
							className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--sea-ink-soft)]"
							style={{ animationDelay: "150ms" }}
						/>
						<span
							className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--sea-ink-soft)]"
							style={{ animationDelay: "300ms" }}
						/>
					</div>
				</div>
			)}
			<div ref={bottomRef} />
		</div>
	);
}

export default function TravelChat() {
	const { messages, sendMessage, isLoading } = useTravelChat();
	const [input, setInput] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [speechSupported, setSpeechSupported] = useState(false);
	const [speechError, setSpeechError] = useState<string | null>(null);
	const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const recognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;

		if (!recognitionCtor) {
			setSpeechSupported(false);
			return;
		}

		const recognition = new recognitionCtor();
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.lang = "en-US";
		recognition.onresult = (event) => {
			const transcript = Array.from(event.results)
				.map((result) => result[0]?.transcript ?? "")
				.join(" ")
				.trim();

			if (transcript) {
				setInput((current) => (current ? `${current} ${transcript}` : transcript));
			}
		};
		recognition.onerror = (event) => {
			const message = describeSpeechError(event.error);
			setSpeechError(message);
			setIsListening(false);
		};
		recognition.onend = () => {
			setIsListening(false);
		};
		recognition.onstart = () => {
			setIsListening(true);
		};

		recognitionRef.current = recognition;
		setSpeechSupported(true);

		return () => {
			recognition.onresult = null;
			recognition.onerror = null;
			recognition.onend = null;
			recognition.onstart = null;
			recognition.stop();
		};
	}, []);

	const submit = () => {
		const text = input.trim();
		if (!text) return;
		sendMessage(text);
		setInput("");
		setSpeechError(null);
	};

	const describeSpeechError = (error: string) => {
		switch (error) {
			case "audio-capture":
				return "Microphone access was blocked or no microphone was found. Please allow microphone access and try again.";
			case "not-allowed":
				return "Microphone permission was denied. Please allow access in your browser and try again.";
			case "no-speech":
				return "No speech was detected. Try speaking a little more clearly.";
			case "network":
				return "Speech recognition hit a network issue. Please try again.";
			default:
				return `Speech recognition error: ${error}`;
		}
	};

	const toggleListening = async () => {
		if (!recognitionRef.current) {
			setSpeechError("Speech recognition is not available in this browser.");
			return;
		}

		if (isListening) {
			recognitionRef.current.stop();
			setIsListening(false);
			return;
		}

		setSpeechError(null);

		try {
			if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				stream.getTracks().forEach((track) => track.stop());
			}
			recognitionRef.current.start();
		} catch {
			setSpeechError(
				"Microphone access is required for voice input. Please allow access and try again.",
			);
		}
	};

	return (
		<div className="island-shell flex h-[600px] flex-col overflow-hidden rounded-2xl">
			<div className="flex items-center gap-2 border-b border-[var(--line)] px-5 py-4">
				<BotIcon size={20} className="text-[var(--lagoon-deep)]" />
				<h2 className="text-base font-semibold text-[var(--sea-ink)]">
					Travel Assistant
				</h2>
			</div>

			<Messages messages={messages} isLoading={isLoading} />

			<div className="border-t border-[var(--line)] px-4 py-3">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
					className="space-y-2"
				>
					<div className="relative">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit();
								}
							}}
							placeholder="Tell me about your travel style or a destination"
							className="demo-textarea w-full resize-none pr-24 text-sm"
							rows={1}
							style={{ minHeight: "40px", maxHeight: "120px" }}
							onInput={(e) => {
								const el = e.target as HTMLTextAreaElement;
								el.style.height = "auto";
								el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
							}}
						/>
						<button
							type="button"
							onClick={toggleListening}
							disabled={!speechSupported}
							className="absolute right-10 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)] disabled:opacity-30"
							aria-label={isListening ? "Stop voice input" : "Start voice input"}
						>
							{isListening ? <Square size={16} /> : <MicIcon size={16} />}
						</button>
						<button
							type="submit"
							disabled={!input.trim()}
							className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)] disabled:opacity-30"
						>
							<Send size={16} />
						</button>
					</div>
					<div className="flex flex-col gap-1 text-xs text-[var(--sea-ink-soft)] sm:flex-row sm:items-center sm:justify-between">
						<p>
							{isListening
								? "Listening for your voice input…"
								: speechSupported
									? "Tap the mic to speak"
									: "Voice input is not available in this browser"}
						</p>
						{speechError && <p className="text-rose-600">{speechError}</p>}
					</div>
				</form>
			</div>
		</div>
	);
}
