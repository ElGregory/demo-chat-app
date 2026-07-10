import "dotenv/config"
import { Client } from "pg"

const destinationData = [
	{
		name: "Tokyo",
		info: {
			country: "Japan",
			region: "Kanto",
			climate: "Temperate",
			bestTime: "April-May, September-October",
			attractions: ["Senso-ji Temple", "Tokyo Tower", "Shibuya Crossing", "Meiji Shrine"],
			cuisine: "Sushi, Ramen, Tempura",
			budget: "Moderate to High",
			timezone: "JST (UTC+9)",
			language: "Japanese",
		},
	},
	{
		name: "Paris",
		info: {
			country: "France",
			region: "Île-de-France",
			climate: "Temperate",
			bestTime: "April-June, September-October",
			attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Arc de Triomphe"],
			cuisine: "French bistro, Pastries, Cheese",
			budget: "High",
			timezone: "CET (UTC+1)",
			language: "French",
		},
	},
	{
		name: "Barcelona",
		info: {
			country: "Spain",
			region: "Catalonia",
			climate: "Mediterranean",
			bestTime: "May-June, September-October",
			attractions: ["Sagrada Familia", "Park Güell", "Gothic Quarter", "Las Ramblas"],
			cuisine: "Tapas, Paella, Seafood",
			budget: "Moderate",
			timezone: "CET (UTC+1)",
			language: "Spanish, Catalan",
		},
	},
	{
		name: "New York",
		info: {
			country: "United States",
			region: "New York",
			climate: "Humid Continental",
			bestTime: "April-May, September-October",
			attractions: ["Statue of Liberty", "Central Park", "Times Square", "Brooklyn Bridge"],
			cuisine: "Pizza, Hot dogs, Diverse cuisines",
			budget: "High",
			timezone: "EST (UTC-5)",
			language: "English",
		},
	},
	{
		name: "Bangkok",
		info: {
			country: "Thailand",
			region: "Central Thailand",
			climate: "Tropical",
			bestTime: "November-February",
			attractions: ["Grand Palace", "Wat Phra Kaew", "Chao Phraya River", "Floating Markets"],
			cuisine: "Thai curry, Pad Thai, Street food",
			budget: "Budget-friendly",
			timezone: "ICT (UTC+7)",
			language: "Thai",
		},
	},
	{
		name: "Sydney",
		info: {
			country: "Australia",
			region: "New South Wales",
			climate: "Temperate",
			bestTime: "September-November, March-May",
			attractions: ["Sydney Opera House", "Harbour Bridge", "Bondi Beach", "Blue Mountains"],
			cuisine: "Seafood, Modern Australian, Coffee",
			budget: "High",
			timezone: "AEDT (UTC+11)",
			language: "English",
		},
	},
	{
		name: "Bali",
		info: {
			country: "Indonesia",
			region: "Bali",
			climate: "Tropical",
			bestTime: "April-October",
			attractions: ["Ubud Rice Terraces", "Tanah Lot Temple", "Mount Batur", "Seminyak Beach"],
			cuisine: "Balinese curry, Satay, Nasi Goreng",
			budget: "Budget-friendly",
			timezone: "WITA (UTC+8)",
			language: "Indonesian",
		},
	},
	{
		name: "Rome",
		info: {
			country: "Italy",
			region: "Lazio",
			climate: "Mediterranean",
			bestTime: "April-May, September-October",
			attractions: ["Colosseum", "Vatican City", "Roman Forum", "Trevi Fountain"],
			cuisine: "Pasta, Pizza, Gelato",
			budget: "Moderate",
			timezone: "CET (UTC+1)",
			language: "Italian",
		},
	},
]

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

		for (const dest of destinationData) {
			await client.query(
				`
					INSERT INTO destinations (name, info, last_queried)
					VALUES ($1, $2::jsonb, NOW())
					ON CONFLICT (name) DO NOTHING
				`,
				[dest.name, JSON.stringify(dest.info)],
			)
			console.log(`  ✓ ${dest.name}`)
		}

		await client.end()
		console.log(`\n✓ Seeded ${destinationData.length} destinations`)
	} catch (err) {
		console.error("\nERROR:", err.message)
		if (err.message.includes("password")) {
			console.error("\nCheck your DATABASE_URL in .env.local")
			console.error("Format: postgresql://username:password@host:port/database")
		}
		if (err.message.includes("connect")) {
			console.error("\nIs PostgreSQL running? Start with: docker-compose up -d postgres")
		}
		client.end()
		process.exit(1)
	}
}

seed()
