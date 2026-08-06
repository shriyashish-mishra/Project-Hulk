import { BackLink } from "@/components/ui/back-link";

const LAST_UPDATED = "August 6, 2026";
const CONTACT_EMAIL = "shriyashishm@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <BackLink href="/signup" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1.5 text-base font-bold">1. What we collect</h2>
          <p>To provide the Service, Project Hulk stores what you log, including:</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>Account info: your email and password (handled by our authentication provider, Supabase).</li>
            <li>
              Profile details: display name, date of birth, biological sex, height, weight, fitness goal, activity
              level, and timezone.
            </li>
            <li>Daily logs: meals, workouts, water, sleep, and body weight over time.</li>
            <li>Optional data you choose to add: progress photos and menstrual cycle tracking.</li>
            <li>Generated content: nightly coach reports you import back into the Service after using Claude.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">2. How we use it</h2>
          <p>
            We use your data to run the Service for you — computing your nutrition and training targets, showing
            your trends and progress, building the nightly report prompt from your day&rsquo;s logs, and storing the
            report you bring back. We don&rsquo;t use your data for advertising, and we don&rsquo;t sell it.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">3. AI reports are your action, not ours</h2>
          <p>
            The nightly coach report works by generating a text prompt from your logged data, which you copy and
            paste into your own Claude conversation, then paste the reply back in. Project Hulk itself never sends
            your data to Anthropic or any other AI provider automatically — that exchange happens directly between
            you and the AI service you choose to use, outside of Project Hulk&rsquo;s systems.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">4. Sensitive health data</h2>
          <p>
            Menstrual cycle tracking is entirely opt-in. If you choose to use it, that data is stored the same way
            as your other logs — private to your account, never shared, and deletable at any time. You can turn
            cycle tracking off in your profile settings whenever you like.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">5. Where your data lives</h2>
          <p>
            Your data is stored with Supabase (database, authentication, and photo storage) and the Service is
            hosted on Vercel. These providers process data on our behalf under their own security and privacy
            commitments; we don&rsquo;t share your data with any other third party.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">6. Your rights</h2>
          <p>
            You can review and edit most of your profile information directly in the app. You can permanently
            delete your logged data from Profile settings at any time, and you can delete your account entirely by
            contacting us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">7. Data retention</h2>
          <p>
            We keep your data for as long as your account is active, so your history and trends stay intact. If you
            delete your account, your data is permanently removed from our systems.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">8. Security</h2>
          <p>
            Your data is protected by row-level access controls, meaning your account can only ever read or write
            your own data — never another user&rsquo;s. No system is perfectly secure, but we take reasonable
            technical measures to protect your information.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">9. Children&rsquo;s privacy</h2>
          <p>
            Project Hulk is not intended for children under 13, and we don&rsquo;t knowingly collect data from
            anyone under that age.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">10. Changes to this policy</h2>
          <p>
            If this policy changes, we&rsquo;ll update the &ldquo;Last updated&rdquo; date above. Significant
            changes will be communicated within the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">11. Contact</h2>
          <p>
            Questions about this policy or your data? Reach out at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
