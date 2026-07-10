import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Compass, Sun } from "lucide-react";
import { useTRPC } from "#/integrations/trpc/react";
import type { DestinationInfo } from "#/lib/services/destinationService";

export const Route = createFileRoute("/destinations")({
	component: DestinationsPage,
});

function DestinationCard({
	name,
	info,
}: {
	name: string;
	info: DestinationInfo;
}) {
	return (
		<article className="island-shell flex flex-col gap-4 rounded-2xl p-5">
			<div>
				<div className="flex items-start justify-between gap-2">
					<h2 className="text-xl font-bold text-[var(--sea-ink)]">{name}</h2>
					{info.visaNotes && (
						<span className="island-kicker shrink-0 text-[10px] bg-[rgba(79,184,178,0.1)] text-[var(--lagoon-deep)] border border-[rgba(79,184,178,0.2)] px-2 py-0.5 rounded">
							🛂 Visa Info
						</span>
					)}
				</div>
				<p className="mt-1 flex items-center gap-1 text-xs text-[var(--sea-ink-soft)] uppercase tracking-wider font-semibold">
					<Sun size={12} />
					Best Seasons: {info.bestSeasons.join(", ")}
				</p>
			</div>

			<div className="grid grid-cols-1 gap-2 text-sm border-t border-b border-[var(--line)] py-3">
				<div className="flex flex-col gap-1">
					<span className="text-[10px] font-bold uppercase text-[var(--sea-ink-soft)] tracking-wider">Average Daily Budget</span>
					<div className="flex justify-between text-xs bg-[var(--chip-bg)] p-2 rounded-lg border border-[var(--chip-line)]">
						<span>🎒 Budget: <strong>${info.averageDailyBudgetUSD.budget}</strong></span>
						<span>🏨 Mid: <strong>${info.averageDailyBudgetUSD.midRange}</strong></span>
						<span>💎 Luxury: <strong>${info.averageDailyBudgetUSD.luxury}</strong></span>
					</div>
				</div>
			</div>

			<div>
				<p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)] flex items-center gap-1">
					<Compass size={12} />
					Known For
				</p>
				<ul className="flex flex-wrap gap-1.5">
					{info.knownFor.map((item) => (
						<li
							key={item}
							className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs text-[var(--sea-ink)]"
						>
							{item}
						</li>
					))}
				</ul>
			</div>

			{info.visaNotes && (
				<p className="text-xs text-[var(--sea-ink-soft)] italic bg-amber-50/50 border border-amber-100/50 p-2 rounded-lg mt-auto">
					📝 {info.visaNotes}
				</p>
			)}
		</article>
	);
}

function DestinationsPage() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.destinations.list.queryOptions());

	return (
		<main className="page-wrap px-4 pb-16 pt-10">
			<section className="mb-8">
				<p className="island-kicker mb-2">Explore</p>
				<h1 className="display-title text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
					Featured Destinations
				</h1>
				<p className="mt-3 max-w-2xl text-[var(--sea-ink-soft)]">
					{data.length} destinations to discover. Ask the travel assistant on
					the home page for personalised recommendations.
				</p>
			</section>

			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{data.map((dest) => (
					<DestinationCard
						key={dest.id}
						name={dest.name}
						info={dest.info as DestinationInfo}
					/>
				))}
			</div>
		</main>
	);
}
