export type ChatSummary = {
	toolFeedback?: string
	profileUpdate: string[]
	conflicts: string[]
	destination: string[]
	hasStructuredInfo: boolean
}

export function parseChatSummary(text: string): ChatSummary {
	const normalized = text.trim()
	if (!normalized) {
		return {
			profileUpdate: [],
			conflicts: [],
			destination: [],
			hasStructuredInfo: false,
		}
	}

	const sections: Record<string, string[]> = {
		toolFeedback: [],
		profileUpdate: [],
		conflicts: [],
		destination: [],
	}

	const lines = normalized.split(/\r?\n/)
	let currentSection: keyof typeof sections | null = null

	for (const rawLine of lines) {
		const line = rawLine.trim()
		if (!line) continue

		if (/^Tool feedback:/i.test(line)) {
			currentSection = "toolFeedback"
			sections.toolFeedback.push(line.replace(/^Tool feedback:/i, "").trim())
			continue
		}

		if (/^Profile update:/i.test(line)) {
			currentSection = "profileUpdate"
			continue
		}

		if (/^Conflicts:/i.test(line)) {
			currentSection = "conflicts"
			continue
		}

		if (/^Destination:/i.test(line)) {
			currentSection = "destination"
			continue
		}

		if (/^[-•]/.test(line)) {
			if (currentSection) {
				sections[currentSection].push(line.replace(/^[-•]\s*/, ""))
			}
			continue
		}

		if (currentSection && currentSection === "toolFeedback") {
			sections.toolFeedback.push(line)
		}
	}

	const hasStructuredInfo = Object.values(sections).some((values) => values.length > 0)

	return {
		toolFeedback: sections.toolFeedback.join(" ").trim() || undefined,
		profileUpdate: sections.profileUpdate,
		conflicts: sections.conflicts,
		destination: sections.destination,
		hasStructuredInfo,
	}
}
