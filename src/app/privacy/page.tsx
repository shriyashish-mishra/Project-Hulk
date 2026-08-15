import { BackLink } from "@/components/ui/back-link";

const LAST_UPDATED = "August 14, 2026";
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
            <li>
              Generated content: nightly coach reports, generated automatically each night from that day&rsquo;s
              logs (or manually via your own Claude conversation, if you use that path instead).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">2. How we use it</h2>
          <p>
            We use your data to run the Service for you — computing your nutrition and training targets, showing
            your trends and progress, and generating your nightly coach report from that day&rsquo;s logs. We
            don&rsquo;t use your data for advertising, and we don&rsquo;t sell it.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">3. AI-generated reports</h2>
          <p>
            Each night, Project Hulk automatically sends that day&rsquo;s logged data — meals, workouts, hydration,
            sleep, and weight — to{" "}
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Gemini
            </a>
            , Google&rsquo;s AI service, to generate your coach report. We use Gemini&rsquo;s free tier, and
            Google&rsquo;s terms for that tier allow them to use submitted content to improve their products,
            including human review in some cases — a materially different guarantee than a paid tier would carry.
          </p>
          <p>
            Progress photos are never part of this automatic send — no photo bytes leave Project Hulk&rsquo;s
            systems on their own. If you want AI feedback on a progress photo, attach it directly in your own Claude
            conversation, the same way you would for the manual report path below.
          </p>
          <p>
            You can also skip the automatic run for a given night entirely and generate a report yourself instead,
            by copying a prompt into your own Claude conversation and importing the reply back in — that manual path
            stays available from the report screen, and nothing sent that way passes through Project Hulk&rsquo;s
            own systems.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">4. Sensitive health data</h2>
          <p>
            Menstrual cycle tracking is entirely opt-in. If you choose to use it, that data is stored the same way
            as your other logs — private to your account, never shared, and deletable at any time. You can turn
            cycle tracking off in your profile settings whenever you like. When it&rsquo;s on, a coarse phase
            estimate (e.g. &ldquo;day 12 of ~28, follicular phase&rdquo;) is included in the nightly report&rsquo;s
            request to Gemini, the same way it would appear in a prompt you pasted into Claude yourself — never the
            underlying dates you logged, just the derived phase.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">5. Where your data lives</h2>
          <p>
            Your data is stored with Supabase (database, authentication, and photo storage) and the Service is
            hosted on Vercel. These providers, along with Gemini (used only for generating your nightly coach
            report, as described in section 3), process data on our behalf under their own security and privacy
            commitments; we don&rsquo;t share your data with any other third party beyond what&rsquo;s described
            here.
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
