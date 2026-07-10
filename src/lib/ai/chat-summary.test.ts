import { describe, expect, it } from "vitest"
import { parseChatSummary } from "./chat-summary"

describe("parseChatSummary", () => {
	it("parses profile update, conflict, and destination sections", () => {
		const result = parseChatSummary(`
Tool feedback: I’m updating your travel profile and checking a destination.

Profile update:
- Interests: culture, food
- Budget: moderate

Conflicts:
- Budget changed from budget to moderate

Destination:
- I checked Tokyo for climate and budget.
`)

		expect(result.toolFeedback).toBe(
			"I’m updating your travel profile and checking a destination.",
		)
		expect(result.profileUpdate).toEqual(["Interests: culture, food", "Budget: moderate"])
		expect(result.conflicts).toEqual(["Budget changed from budget to moderate"])
		expect(result.destination).toEqual(["I checked Tokyo for climate and budget."])
		expect(result.hasStructuredInfo).toBe(true)
	})

	it("returns no structured sections for plain responses", () => {
		const result = parseChatSummary("I can help you plan a trip to Japan.")

		expect(result.hasStructuredInfo).toBe(false)
		expect(result.toolFeedback).toBeUndefined()
		expect(result.profileUpdate).toEqual([])
		expect(result.conflicts).toEqual([])
		expect(result.destination).toEqual([])
	})
})
