import {
	boolean,
	json,
	pgTable,
	serial,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'

// Conversation history - stores all chat messages
export const conversations = pgTable('conversations', {
	id: serial().primaryKey(),
	role: text().notNull(), // 'user' | 'assistant'
	content: text().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Travel profile - stores extracted user preferences
export const travelProfile = pgTable('travel_profile', {
	id: serial().primaryKey(),
	preferences: json().notNull(), // JSON object with destinations, interests, budget, etc.
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Conflicts - tracks contradictions in stated preferences
export const conflicts = pgTable('conflicts', {
	id: serial().primaryKey(),
	field: text().notNull(), // which profile field has a conflict
	previousValue: json().notNull(),
	newValue: json().notNull(),
	conversationId: serial().notNull(), // reference to conversation message that caused it
	resolved: boolean().default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Destination cache - stores looked-up destination info
export const destinations = pgTable('destinations', {
	id: serial().primaryKey(),
	name: text().notNull().unique(),
	info: json().notNull(), // Cached destination information
	lastQueried: timestamp('last_queried').defaultNow().notNull(),
})
