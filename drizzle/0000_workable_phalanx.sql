CREATE TABLE "conflicts" (
	"id" serial PRIMARY KEY NOT NULL,
	"field" text NOT NULL,
	"previousValue" json NOT NULL,
	"newValue" json NOT NULL,
	"conversationId" serial NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"info" json NOT NULL,
	"last_queried" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "travel_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"preferences" json NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
