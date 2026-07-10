import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import {
	conflicts,
	conversations,
	destinations,
	travelProfile,
} from "#/db/schema";
import { createTRPCRouter, publicProcedure } from "./init";
import { createFallbackProfile, withDatabaseFallback } from "./profile-helpers";

export const trpcRouter = createTRPCRouter({
	// Destinations
	destinations: createTRPCRouter({
		list: publicProcedure.query(async () => {
			return db.select().from(destinations).orderBy(asc(destinations.name));
		}),
		getByName: publicProcedure
			.input(z.object({ name: z.string() }))
			.query(async ({ input }) => {
				const result = await db
					.select()
					.from(destinations)
					.where(eq(destinations.name, input.name))
					.limit(1);
				return result[0] ?? null;
			}),
	}),

	// Conversations
	conversations: createTRPCRouter({
		list: publicProcedure.query(async () => {
			return db
				.select()
				.from(conversations)
				.orderBy(desc(conversations.createdAt))
				.limit(100);
		}),
		create: publicProcedure
			.input(
				z.object({ role: z.enum(["user", "assistant"]), content: z.string() }),
			)
			.mutation(async ({ input }) => {
				const result = await db.insert(conversations).values(input).returning();
				return result[0];
			}),
		clear: publicProcedure.mutation(async () => {
			await db.delete(conversations);
			return { success: true };
		}),
	}),

	// Travel Profile
	profile: createTRPCRouter({
		get: publicProcedure.query(async () => {
			return withDatabaseFallback(createFallbackProfile(), async () => {
				const result = await db.select().from(travelProfile).limit(1);
				return result[0] ?? createFallbackProfile();
			});
		}),
		update: publicProcedure
			.input(
				z.object({
					interests: z.array(z.string()).optional(),
					budget: z.enum(["budget", "moderate", "luxury"]).optional(),
					climate: z.array(z.string()).optional(),
					activities: z.array(z.string()).optional(),
					dreamDestinations: z.array(z.string()).optional(),
					avoidedDestinations: z.array(z.string()).optional(),
				}),
			)
			.mutation(async ({ input }) => {
				return withDatabaseFallback(createFallbackProfile(), async () => {
					const existing = await db.select().from(travelProfile).limit(1);
					const preferences = {
						...((existing[0]?.preferences as Record<string, unknown>) ?? {}),
						...input,
						updatedAt: new Date().toISOString(),
					};

					if (existing[0]) {
						await db
							.update(travelProfile)
							.set({ preferences: preferences as any, updatedAt: new Date() })
							.where(eq(travelProfile.id, existing[0].id));
						return { ...existing[0], preferences };
					}

					const result = await db
						.insert(travelProfile)
						.values({ preferences: preferences as any })
						.returning();
					return result[0];
				});
			}),
	}),

	// Conflicts
	conflicts: createTRPCRouter({
		list: publicProcedure.query(async () => {
			return db
				.select()
				.from(conflicts)
				.where(eq(conflicts.resolved, false))
				.orderBy(desc(conflicts.createdAt))
				.limit(50);
		}),
		resolve: publicProcedure
			.input(
				z.object({
					id: z.number(),
					action: z.enum(["keep_existing", "accept_new", "merge_both"]),
				}),
			)
			.mutation(async ({ input }) => {
				const conflictRecord = await db
					.select()
					.from(conflicts)
					.where(eq(conflicts.id, input.id))
					.limit(1);

				if (!conflictRecord[0]) {
					throw new Error("Conflict not found");
				}

				if (input.action === "accept_new" || input.action === "merge_both") {
					// We need to update the profile with the new value
					const existingProfile = await db.select().from(travelProfile).limit(1);
					if (existingProfile[0]) {
						const currentPreferences = (existingProfile[0]
							.preferences as Record<string, unknown>) ?? {};
						
						let finalValue = conflictRecord[0].newValue;
						
						if (input.action === "merge_both") {
							const prev = conflictRecord[0].previousValue;
							const curr = conflictRecord[0].newValue;
							if (Array.isArray(prev) && Array.isArray(curr)) {
								finalValue = Array.from(new Set([...prev, ...curr]));
							}
						}

						const updatedPreferences = {
							...currentPreferences,
							[conflictRecord[0].field]: finalValue,
							updatedAt: new Date().toISOString(),
						};

						await db
							.update(travelProfile)
							.set({
								preferences: updatedPreferences as any,
								updatedAt: new Date(),
							})
							.where(eq(travelProfile.id, existingProfile[0].id));
					}
				}

				await db
					.update(conflicts)
					.set({ resolved: true })
					.where(eq(conflicts.id, input.id));

				return { success: true };
			}),
	}),
});

export type TRPCRouter = typeof trpcRouter;
