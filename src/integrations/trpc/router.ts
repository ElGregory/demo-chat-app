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
			const result = await db.select().from(travelProfile).limit(1);
			return result[0] ?? null;
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
				} else {
					const result = await db
						.insert(travelProfile)
						.values({ preferences: preferences as any })
						.returning();
					return result[0];
				}
			}),
	}),

	// Conflicts
	conflicts: createTRPCRouter({
		list: publicProcedure.query(async () => {
			return db
				.select()
				.from(conflicts)
				.orderBy(desc(conflicts.createdAt))
				.limit(50);
		}),
		resolve: publicProcedure
			.input(z.object({ id: z.number(), resolution: z.string() }))
			.mutation(async ({ input }) => {
				await db
					.update(conflicts)
					.set({ resolved: true })
					.where(eq(conflicts.id, input.id));
				return { success: true };
			}),
	}),
});

export type TRPCRouter = typeof trpcRouter;
