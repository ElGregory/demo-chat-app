import { afterEach, describe, expect, it, vi } from "vitest";
import { getTrpcUrl } from "./url";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe("getTrpcUrl", () => {
	it("uses the browser origin when available", () => {
		vi.stubGlobal("window", {
			location: {
				origin: "http://localhost:3001",
			},
		});

		expect(getTrpcUrl()).toBe("http://localhost:3001/api/trpc");
	});

	it("falls back to the app port when no window exists", () => {
		vi.stubEnv("PORT", "3001");
		vi.stubGlobal("window", undefined);

		expect(getTrpcUrl()).toBe("http://127.0.0.1:3001/api/trpc");
	});
});
