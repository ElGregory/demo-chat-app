import { toolDefinition } from "@tanstack/ai"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "#/db"
import { conflicts, conversations, travelProfile } from "#/db/schema"

const ProfileInputSchema = z.object({
	interests: z.array(z.string()).optional(),
	budget: z.enum(["budget", "moderate", "luxury"]).optional(),
	climate: z.array(z.string()).optional(),
	activities: z.array(z.string()).optional(),
	dreamDestinations: z.array(z.string()).optional(),
	avoidedDestinations: z.array(z.string()).optional(),
})

export const extractProfileToolDef = toolDefinition({
	name: "extractProfile",
	description:
		"Extract or update the traveler's profile preferences from the conversation.",
	inputSchema: ProfileInputSchema,
	outputSchema: z.object({
		updated: z.boolean(),
		conflicts: z.array(
			z.object({
				field: z.string(),
				previous: z.string(),
				new: z.string(),
			}),
		),
	}),
})

async function detectConflict(
	field: string,
	newValue: unknown,
	existing: Record<string, unknown>,
): Promise<{ hasConflict: boolean; previous: string; new: string } | null> {
	const existingValue = existing[field]
	if (!existingValue) return null
	if (JSON.stringify(existingValue) === JSON.stringify(newValue)) return null

	if (Array.isArray(existingValue) && Array.isArray(newValue)) {
		const existingSet = new Set(existingValue)
		const newSet = new Set(newValue)
		const removed = existingValue.filter((v) => !newSet.has(v))
		const added = newValue.filter((v) => !existingSet.has(v))

		// If we only added items (no removals), it's not a conflict, just an update.
		if (removed.length === 0) return null

		return {
			hasConflict: true,
			previous: `${existingValue.length} items: ${existingValue.join(", ")}`,
			new: `${newValue.length} items: ${newValue.join(", ")}`,
		}
	}

	return {
		hasConflict: true,
		previous: String(existingValue),
		new: String(newValue),
	}
}

async function saveConflict(
	field: string,
	previousValue: unknown,
	newValue: unknown,
	conversationId: number,
) {
	await db.insert(conflicts).values({
		field,
		previousValue: previousValue as any,
		newValue: newValue as any,
		conversationId,
		resolved: false,
	})
}

export const extractProfile = extractProfileToolDef.server(async (args) => {
	const { interests, budget, climate, activities, dreamDestinations, avoidedDestinations } =
		args as z.infer<typeof ProfileInputSchema>

	const inputData: Record<string, unknown> = {}
	if (interests !== undefined) inputData.interests = interests
	if (budget !== undefined) inputData.budget = budget
	if (climate !== undefined) inputData.climate = climate
	if (activities !== undefined) inputData.activities = activities
	if (dreamDestinations !== undefined) inputData.dreamDestinations = dreamDestinations
	if (avoidedDestinations !== undefined) inputData.avoidedDestinations = avoidedDestinations

	const existingResult = await db
		.select()
		.from(travelProfile)
		.orderBy(desc(travelProfile.updatedAt))
		.limit(1)

	const existing = (existingResult[0]?.preferences as Record<string, unknown>) ?? {}
	const conversationResult = await db
		.select()
		.from(conversations)
		.orderBy(desc(conversations.id))
		.limit(1)
	const conversationId = conversationResult[0]?.id ?? 0

	const conflictResults: Array<{
		field: string
		previous: string
		new: string
	}> = []

	// Only apply non-conflicting fields immediately
	const fieldsToUpdate: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(inputData)) {
		if (value !== undefined) {
			const conflict = await detectConflict(key, value, existing)
			if (conflict) {
				conflictResults.push({
					field: key,
					previous: conflict.previous,
					new: conflict.new,
				})
				await saveConflict(key, existing[key], value, conversationId)
			} else {
				fieldsToUpdate[key] = value
			}
		}
	}

	const newPreferences = {
		...existing,
		...fieldsToUpdate,
		updatedAt: new Date().toISOString(),
	}

	if (existingResult[0]) {
		await db
			.update(travelProfile)
			.set({
				preferences: newPreferences as any,
				updatedAt: new Date(),
			})
			.where(eq(travelProfile.id, existingResult[0].id))
	} else {
		await db.insert(travelProfile).values({
			preferences: newPreferences as any,
		})
	}

	return {
		updated: true,
		conflicts: conflictResults,
	}
})