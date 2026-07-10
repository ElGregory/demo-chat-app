import { createFileRoute, Link } from "@tanstack/react-router";
import TravelChat from "#/components/chat/TravelChat";

export const Route = createFileRoute("/")({ component: HomePage });

const highlights = [
	{
		title: "Streaming Chat",
		desc: "Powered by Google Gemini with real-time streaming responses.",
	},
	{
		title: "Destination Knowledge",
		desc: "Ask about any of the featured destinations — the AI looks them up from the database.",
	},
	{
		title: "Profile Builder",
		desc: "As you chat, the assistant learns your preferences and builds your travel profile.",
	},
	{
		title: "Conflict Detection",
		desc: "Contradictions in your stated preferences are detected and flagged automatically.",
	},
];

function HomePage() {
	return (
		<main className="page-wrap px-4 pb-16 pt-10">
			{/* Hero */}
			<section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16">
				<div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.28),transparent_66%)]" />
				<div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.16),transparent_66%)]" />

				<p className="island-kicker mb-3">Profile Builder</p>
				<h1 className="display-title mb-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[var(--sea-ink)] sm:text-6xl">
					Hello World,{" "}
					<span className="text-[var(--lagoon-deep)]">Let's Travel!</span>
				</h1>
				<p className="mb-8 max-w-xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
					Chat with the AI travel assistant below to discover destinations and
					build your personal travel profile through natural conversation.
				</p>
				<Link
					to="/destinations"
					className="inline-flex items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
				>
					Browse Destinations →
				</Link>
			</section>

			{/* Chat + Features */}
			<div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
				{/* Chat */}
				<TravelChat />

				{/* Feature pills */}
				<div className="flex flex-col gap-4">
					{highlights.map((h, i) => (
						<article
							key={h.title}
							className="island-shell rise-in rounded-2xl p-5"
							style={{ animationDelay: `${i * 80 + 60}ms` }}
						>
							<h3 className="mb-1 text-sm font-semibold text-[var(--sea-ink)]">
								{h.title}
							</h3>
							<p className="m-0 text-sm text-[var(--sea-ink-soft)]">{h.desc}</p>
						</article>
					))}
				</div>
			</div>
		</main>
	);
}
