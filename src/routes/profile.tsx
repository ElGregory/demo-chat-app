import { createFileRoute } from "@tanstack/react-router";
import TravelChat from "#/components/chat/TravelChat";
import ProfileView from "#/components/profile/ProfileView";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<main className="page-wrap px-4 pb-16 pt-10">
			<section className="mb-8">
				<p className="island-kicker mb-2">Your Profile</p>
				<h1 className="display-title text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
					Travel Profile
				</h1>
				<p className="mt-3 max-w-2xl text-[var(--sea-ink-soft)]">
					Your travel preferences, built through conversation. Click any field
					to edit.
				</p>
			</section>

			<div className="grid gap-8 lg:grid-cols-[1fr_400px]">
				<ProfileView />

				<div className="flex flex-col gap-4">
					<div className="island-shell rounded-2xl p-5">
						<h3 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">
							Profile Tips
						</h3>
						<ul className="space-y-2 text-sm text-[var(--sea-ink-soft)]">
							<li>• Chat with the AI to naturally build your profile</li>
							<li>• Mention your interests, budget, and dream destinations</li>
							<li>• The AI will detect conflicts and ask for clarification</li>
							<li>• Click any field above to manually edit</li>
						</ul>
					</div>

					<div className="island-shell flex-1 rounded-2xl p-5">
						<h3 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">
							Quick Chat
						</h3>
						<p className="mb-3 text-sm text-[var(--sea-ink-soft)]">
							Tell me more about your travel style!
						</p>
						<TravelChat />
					</div>
				</div>
			</div>
		</main>
	);
}
