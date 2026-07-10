import "dotenv/config"
import { Client } from "pg"
import { getDestinationsList } from "../src/lib/services/destinationService"

async function seed() {
	console.log("Loading environment...")
	
	if (!process.env.DATABASE_URL) {
		console.error("ERROR: DATABASE_URL is not set in .env.local")
		process.exit(1)
	}

	console.log("DATABASE_URL:", process.env.DATABASE_URL)

	// Parse connection string to extract parts
	const url = new URL(process.env.DATABASE_URL)
	const password = url.password || "postgres"
	const username = url.username || "postgres"
	const host = url.hostname
	const port = parseInt(url.port || "5432")
	const database = url.pathname.replace("/", "")

	console.log("Parsed: host=", host, "port=", port, "user=", username, "db=", database)

	const client = new Client({
		host,
		port,
		database,
		user: username,
		password,
	})

	try {
		await client.connect()
		console.log("Connected to PostgreSQL at", host + ":" + port + "/" + database)

		const destinationData = await getDestinationsList()

		for (const dest of destinationData) {
			await client.query(
				`
					INSERT INTO destinations (name, info, last_queried)
					VALUES ($1, $2::jsonb, NOW())
					ON CONFLICT (name) DO UPDATE SET info = EXCLUDED.info, last_queried = NOW()
				`,
				[dest.name, JSON.stringify(dest)],
			)
			console.log(`  ✓ ${dest.name}`)
		}

		await client.end()
		console.log(`\n✓ Seeded ${destinationData.length} destinations`)
	} catch (err: any) {
		console.error("\nERROR:", err?.message || err)
		if (err?.message && err.message.includes("password")) {
			console.error("\nCheck your DATABASE_URL in .env.local")
			console.error("Format: postgresql://username:password@host:port/database")
		}
		if (err?.message && err.message.includes("connect")) {
			console.error("\nIs PostgreSQL running? Start with: docker-compose up -d postgres")
		}
		client.end()
		process.exit(1)
	}
}

seed()
