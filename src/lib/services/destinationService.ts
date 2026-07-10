export type DestinationInfo = {
	name: string;
	bestSeasons: Array<"spring" | "summer" | "fall" | "winter">;
	knownFor: string[];
	averageDailyBudgetUSD: { budget: number; midRange: number; luxury: number };
	visaNotes?: string;
};

const DESTINATIONS_DB: Record<string, DestinationInfo> = {
	tokyo: {
		name: "Tokyo",
		bestSeasons: ["spring", "fall"],
		knownFor: ["food", "shopping", "culture", "temples"],
		averageDailyBudgetUSD: { budget: 50, midRange: 150, luxury: 400 },
		visaNotes: "Visa-free for up to 90 days for most countries.",
	},
	paris: {
		name: "Paris",
		bestSeasons: ["spring", "fall"],
		knownFor: ["art", "architecture", "food", "museums"],
		averageDailyBudgetUSD: { budget: 80, midRange: 200, luxury: 500 },
		visaNotes: "Schengen Visa rules apply. ETIAS required from 2025.",
	},
	barcelona: {
		name: "Barcelona",
		bestSeasons: ["spring", "summer", "fall"],
		knownFor: ["beach", "architecture", "nightlife", "food"],
		averageDailyBudgetUSD: { budget: 60, midRange: 130, luxury: 350 },
		visaNotes: "Schengen Visa rules apply. ETIAS required from 2025.",
	},
	"new york": {
		name: "New York",
		bestSeasons: ["spring", "fall"],
		knownFor: ["theater", "shopping", "museums", "skyline"],
		averageDailyBudgetUSD: { budget: 100, midRange: 250, luxury: 600 },
		visaNotes: "ESTA required for visa-waiver program countries.",
	},
	bangkok: {
		name: "Bangkok",
		bestSeasons: ["winter"],
		knownFor: ["street food", "temples", "markets"],
		averageDailyBudgetUSD: { budget: 25, midRange: 60, luxury: 180 },
		visaNotes: "Visa on arrival available for many nationalities.",
	},
	sydney: {
		name: "Sydney",
		bestSeasons: ["spring", "summer", "fall"],
		knownFor: ["beaches", "architecture", "nature", "outdoor"],
		averageDailyBudgetUSD: { budget: 90, midRange: 220, luxury: 550 },
		visaNotes: "Electronic Travel Authority (ETA) required.",
	},
	bali: {
		name: "Bali",
		bestSeasons: ["summer"],
		knownFor: ["beach", "temples", "relaxation", "surfing"],
		averageDailyBudgetUSD: { budget: 30, midRange: 80, luxury: 250 },
		visaNotes: "Visa on Arrival (VoA) required for most visitors.",
	},
	rome: {
		name: "Rome",
		bestSeasons: ["spring", "fall"],
		knownFor: ["history", "architecture", "pasta", "art"],
		averageDailyBudgetUSD: { budget: 55, midRange: 140, luxury: 380 },
		visaNotes: "Schengen Visa rules apply. ETIAS required from 2025.",
	},
};

export async function getDestinationInfo(name: string): Promise<DestinationInfo | null> {
	if (!name) return null;
	const key = name.toLowerCase().trim();
	return DESTINATIONS_DB[key] ?? null;
}

export async function getDestinationsList(): Promise<DestinationInfo[]> {
	return Object.values(DESTINATIONS_DB);
}
