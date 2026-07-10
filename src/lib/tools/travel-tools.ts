import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { getDestinationInfo as getDestinationFromService } from "../services/destinationService";

const destinationInfoSchema = z.object({
	name: z.string(),
	bestSeasons: z.array(z.enum(["spring", "summer", "fall", "winter"])),
	knownFor: z.array(z.string()),
	averageDailyBudgetUSD: z.object({
		budget: z.number(),
		midRange: z.number(),
		luxury: z.number(),
	}),
	visaNotes: z.string().optional(),
});

export const getDestinationInfoToolDef = toolDefinition({
	name: "getDestinationInfo",
	description:
		"Look up structured information about a travel destination including its name, best seasons to visit, activities/interests it is known for, average daily budgets (budget, mid-range, luxury), and visa notes.",
	inputSchema: z.object({
		destination: z
			.string()
			.describe("Name of the city or destination to look up"),
	}),
	outputSchema: z.union([
		destinationInfoSchema,
		z.object({ error: z.string() }),
	]),
});

export const getDestinationInfo = getDestinationInfoToolDef.server(
	async ({ destination }) => {
		const info = await getDestinationFromService(destination);

		if (!info) {
			return {
				error: `No information found for "${destination}". Try asking about featured destinations like Tokyo, Paris, Barcelona, New York, Bangkok, Sydney, Bali, or Rome.`,
			};
		}

		return info;
	},
);
