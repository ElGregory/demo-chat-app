export function createFallbackProfile() {
	return {
		id: 0,
		preferences: {},
		updatedAt: null,
	}
}

export async function withDatabaseFallback<T>(
	fallback: T,
	operation: () => Promise<T>,
): Promise<T> {
	if (!process.env.DATABASE_URL) {
		return fallback
	}

	try {
		return await operation()
	} catch (error) {
		console.error("[trpc] Database unavailable, using fallback data", error)
		return fallback
	}
}
