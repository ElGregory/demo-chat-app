import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Globe, MapPin, Wallet } from "lucide-react";
import { useTRPC } from "#/integrations/trpc/react";

export const Route = createFileRoute("/destinations")({
	component: DestinationsPage,
});

type DestinationInfo = {
	country: string;
	region: string;
	climate: string;
	bestTime: string;
	attractions: string[];
	cuisine: string;
	budget: string;
	timezone: string;
	language: string;
};

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
					<span className="island-kicker shrink-0 text-xs">{info.budget}</span>
				</div>
				<p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--sea-ink-soft)]">
					<MapPin size={13} />
					{info.region}, {info.country}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
				<div className="flex items-center gap-1.5 text-[var(--sea-ink-soft)]">
					<Clock size={13} className="shrink-0" />
					<span>{info.bestTime}</span>
				</div>
				<div className="flex items-center gap-1.5 text-[var(--sea-ink-soft)]">
					<Globe size={13} className="shrink-0" />
					<span>{info.language}</span>
				</div>
				<div className="col-span-2 flex items-center gap-1.5 text-[var(--sea-ink-soft)]">
					<Wallet size={13} className="shrink-0" />
					<span>
						{info.climate} · {info.timezone}
					</span>
				</div>
			</div>

			<div>
				<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
					Attractions
				</p>
				<ul className="flex flex-wrap gap-1.5">
					{info.attractions.map((a) => (
						<li
							key={a}
							className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs text-[var(--sea-ink)]"
						>
							{a}
						</li>
					))}
				</ul>
			</div>

			<p className="border-t border-[var(--line)] pt-3 text-sm text-[var(--sea-ink-soft)]">
				🍽 {info.cuisine}
			</p>
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
