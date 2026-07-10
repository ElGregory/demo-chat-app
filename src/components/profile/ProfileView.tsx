import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Check, Edit2, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "#/integrations/trpc/react";

type ProfileData = {
	id: number;
	preferences: {
		interests?: string[];
		budget?: string;
		climate?: string[];
		activities?: string[];
		dreamDestinations?: string[];
		avoidedDestinations?: string[];
		updatedAt?: string;
	};
	updatedAt: string | null;
};

const budgetLabels: Record<string, string> = {
	budget: "💰 Budget-Friendly",
	moderate: "💵 Moderate",
	luxury: "💎 Luxury",
};

function Tag({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs text-[var(--sea-ink)]">
			{children}
		</span>
	);
}

function EditableField({
	label,
	value,
	onSave,
	placeholder,
}: {
	label: string;
	value?: string[] | string;
	onSave: (newValue: string[]) => void;
	placeholder: string;
}) {
	const [editing, setEditing] = useState(false);
	const [input, setInput] = useState("");

	const items = (value as string[]) ?? [];

	if (editing) {
		return (
			<div className="space-y-2">
				<p className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
					{label}
				</p>
				<div className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={placeholder}
						className="demo-textarea flex-1 text-sm"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const newItems = input
									.split(",")
									.map((s) => s.trim())
									.filter(Boolean);
								onSave(newItems);
								setEditing(false);
							}
							if (e.key === "Escape") {
								setEditing(false);
							}
						}}
					/>
					<button
						onClick={() => {
							const newItems = input
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean);
							onSave(newItems);
							setEditing(false);
						}}
						className="rounded-lg p-2 text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)]"
					>
						<Check size={16} />
					</button>
					<button
						onClick={() => setEditing(false)}
						className="rounded-lg p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--chip-bg)]"
					>
						<X size={16} />
					</button>
				</div>
				<p className="text-xs text-[var(--sea-ink-soft)]">
					Separate with commas, press Enter to save
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
					{label}
				</p>
				<button
					onClick={() => {
						setInput(items.join(", "));
						setEditing(true);
					}}
					className="flex items-center gap-1 text-xs text-[var(--lagoon-deep)] transition hover:underline"
				>
					<Edit2 size={12} />
					Edit
				</button>
			</div>
			{items.length > 0 ? (
				<div className="flex flex-wrap gap-1.5">
					{items.map((item) => (
						<Tag key={item}>{item}</Tag>
					))}
				</div>
			) : (
				<p className="text-sm text-[var(--sea-ink-soft)] italic">
					{placeholder}
				</p>
			)}
		</div>
	);
}

function BudgetField({
	value,
	onSave,
}: {
	value?: string;
	onSave: (newValue: string[]) => void;
}) {
	const options = ["budget", "moderate", "luxury"] as const;

	return (
		<div className="space-y-2">
			<p className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
				Budget
			</p>
			<div className="flex flex-wrap gap-2">
				{options.map((opt) => (
					<button
						key={opt}
						onClick={() => onSave([opt])}
						className={`rounded-full border px-4 py-1.5 text-sm transition ${
							value === opt
								? "border-[var(--lagoon-deep)] bg-[rgba(79,184,178,0.14)] text-[var(--lagoon-deep)]"
								: "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] hover:border-[var(--lagoon-deep)]"
						}`}
					>
						{budgetLabels[opt]}
					</button>
				))}
			</div>
		</div>
	);
}

function ConflictsSection() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: conflicts } = useSuspenseQuery(trpc.conflicts.list.queryOptions());
	const resolveMutation = useMutation(trpc.conflicts.resolve.mutationOptions());

	const handleResolve = async (id: number, action: "keep_existing" | "accept_new" | "merge_both") => {
		await resolveMutation.mutateAsync({ id, action });
		queryClient.invalidateQueries({ queryKey: trpc.conflicts.list.queryKey() });
		queryClient.invalidateQueries({ queryKey: trpc.profile.get.queryKey() });
	};

	if (!conflicts || conflicts.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3 mt-8">
			<div className="flex items-center gap-2 text-rose-600">
				<AlertCircle size={18} />
				<h3 className="font-semibold text-sm uppercase tracking-wider">Pending Conflicts</h3>
			</div>
			<div className="space-y-3">
				{conflicts.map((conflict) => (
					<div key={conflict.id} className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
						<p className="mb-2 text-sm text-rose-900 font-medium">
							I noticed a contradiction about your <span className="font-bold underline">{conflict.field}</span>:
						</p>
						<div className="grid grid-cols-2 gap-3 mb-4">
							<div className="rounded-lg bg-white p-3 shadow-sm border border-rose-100">
								<p className="text-xs font-semibold text-rose-700/70 uppercase tracking-wider mb-1">Previous Preference</p>
								<p className="text-sm font-medium text-[var(--sea-ink)]">
									{typeof conflict.previousValue === 'object' ? JSON.stringify(conflict.previousValue) : String(conflict.previousValue)}
								</p>
							</div>
							<div className="rounded-lg bg-white p-3 shadow-sm border border-rose-100">
								<p className="text-xs font-semibold text-rose-700/70 uppercase tracking-wider mb-1">New Information</p>
								<p className="text-sm font-medium text-[var(--sea-ink)]">
									{typeof conflict.newValue === 'object' ? JSON.stringify(conflict.newValue) : String(conflict.newValue)}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => handleResolve(conflict.id, "keep_existing")}
								className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-rose-700 shadow-sm border border-rose-200 transition hover:bg-rose-50"
							>
								Keep Previous
							</button>
							<button
								onClick={() => handleResolve(conflict.id, "accept_new")}
								className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700"
							>
								Accept New
							</button>
							{typeof conflict.previousValue === 'object' && Array.isArray(conflict.previousValue) && (
								<button
									onClick={() => handleResolve(conflict.id, "merge_both")}
									className="flex-1 rounded-lg bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--lagoon-dark)]"
								>
									Merge Both
								</button>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function ProfileView() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: profile } = useSuspenseQuery(trpc.profile.get.queryOptions());
	const updateMutation = useMutation(trpc.profile.update.mutationOptions());

	const handleUpdate = async (updates: Record<string, unknown>) => {
		await updateMutation.mutateAsync(updates as any);
		queryClient.invalidateQueries({ queryKey: trpc.profile.get.queryKey() });
	};

	if (!profile) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<div className="h-16 w-16 rounded-full bg-[var(--chip-bg)] flex items-center justify-center">
					<span className="text-2xl">👋</span>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-[var(--sea-ink)]">
						No profile yet
					</h3>
					<p className="text-sm text-[var(--sea-ink-soft)]">
						Start chatting to build your travel profile
					</p>
				</div>
			</div>
		);
	}

	const prefs = profile.preferences as ProfileData["preferences"];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-[var(--sea-ink)]">
					Your Travel Profile
				</h2>
				{prefs.updatedAt && (
					<p className="text-xs text-[var(--sea-ink-soft)]">
						Updated{" "}
						{new Date(prefs.updatedAt).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						})}
					</p>
				)}
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<EditableField
					label="Interests"
					value={prefs.interests}
					onSave={(v) => handleUpdate({ interests: v })}
					placeholder="e.g., culture, food, adventure"
				/>

				<EditableField
					label="Climate Preferences"
					value={prefs.climate}
					onSave={(v) => handleUpdate({ climate: v })}
					placeholder="e.g., tropical, temperate"
				/>

				<EditableField
					label="Favorite Activities"
					value={prefs.activities}
					onSave={(v) => handleUpdate({ activities: v })}
					placeholder="e.g., hiking, museums, beach"
				/>

				<EditableField
					label="Dream Destinations"
					value={prefs.dreamDestinations}
					onSave={(v) => handleUpdate({ dreamDestinations: v })}
					placeholder="e.g., Tokyo, Paris, Bali"
				/>

				<EditableField
					label="Places to Avoid"
					value={prefs.avoidedDestinations}
					onSave={(v) => handleUpdate({ avoidedDestinations: v })}
					placeholder="e.g., cold climates"
				/>
			</div>

			<BudgetField
				value={prefs.budget}
				onSave={(v) => handleUpdate({ budget: v[0] })}
			/>

			<ConflictsSection />
		</div>
	);
}
