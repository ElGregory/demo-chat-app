import { toolDefinition } from "@tanstack/ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { destinations } from "#/db/schema";

const destinationInfoSchema = z.object({
	country: z.string(),
	region: z.string(),
	climate: z.string(),
	bestTime: z.string(),
	attractions: z.array(z.string()),
	cuisine: z.string(),
	budget: z.string(),
	timezone: z.string(),
	language: z.string(),
});

export const getDestinationInfoToolDef = toolDefinition({
	name: "getDestinationInfo",
	description:
		"Look up information about a travel destination including attractions, climate, budget, cuisine and best time to visit.",
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
		const rows = await db
			.select()
			.from(destinations)
			.where(eq(destinations.name, destination))
			.limit(1);

		if (rows.length === 0) {
			return {
				error: `No information found for "${destination}". Try one of the featured destinations.`,
			};
		}

		return rows[0].info as z.infer<typeof destinationInfoSchema>;
	},
);
