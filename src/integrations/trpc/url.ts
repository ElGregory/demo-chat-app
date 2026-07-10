export function getTrpcUrl() {
	if (typeof window !== "undefined" && window.location?.origin) {
		return `${window.location.origin}/api/trpc`;
	}

	const configuredBase =
		process.env.VITE_API_URL ||
		process.env.API_URL ||
		process.env.HOST_URL ||
		process.env.ORIGIN;

	if (configuredBase) {
		return `${configuredBase.replace(/\/$/, "")}/api/trpc`;
	}

	const host = process.env.HOST ?? "127.0.0.1";
	const port = process.env.PORT ?? "3001";
	return `http://${host}:${port}/api/trpc`;
}
