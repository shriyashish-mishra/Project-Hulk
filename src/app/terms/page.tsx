import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";

const LAST_UPDATED = "August 14, 2026";
const CONTACT_EMAIL = "shriyashishm@gmail.com";

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <BackLink href="/signup" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1.5 text-base font-bold">1. Acceptance of terms</h2>
          <p>
            By creating an account or using Project Hulk (&ldquo;the Service&rdquo;), you agree to these Terms of
            Service and to our{" "}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            . If you don&rsquo;t agree, please don&rsquo;t use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">2. What Project Hulk is</h2>
          <p>
            Project Hulk is a personal fitness and nutrition tracker. You log meals, workouts, water, sleep, weight,
            and optionally progress photos and menstrual cycle data. The Service computes targets, trends, and
            summaries from what you log, and generates a nightly &ldquo;coach report&rdquo; automatically each night
            using Gemini, a third-party AI provider — see the{" "}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>{" "}
            for what&rsquo;s sent and why. Progress photos are never part of that automatic send. You can also
            generate a report yourself for a given day by pasting a prompt into your own separate Claude (Anthropic)
            conversation and importing the response back in, instead of the automatic run.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">3. Not medical advice</h2>
          <p>
            Project Hulk provides general fitness and nutrition tracking tools, not medical, dietary, or health
            advice. Nothing in the Service — including targets, scores, coach reports, or weight recommendations —
            is a substitute for professional medical, nutritional, or fitness guidance. Talk to a qualified
            professional before making significant changes to your diet, exercise, or health routine, especially if
            you have an existing health condition.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">4. Eligibility</h2>
          <p>
            You must be at least 13 years old to use Project Hulk. By using the Service, you confirm that you meet
            this requirement and that all information you provide is accurate.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">5. Your account</h2>
          <p>
            You&rsquo;re responsible for keeping your login credentials secure and for all activity under your
            account. Let us know right away at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>{" "}
            if you suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">6. Your content</h2>
          <p>
            You own what you log — your meals, workouts, notes, and photos. You&rsquo;re responsible for what you
            enter, and for having the right to enter it (for example, not uploading someone else&rsquo;s photo). We
            store it to provide the Service back to you; see the Privacy Policy for details on how it&rsquo;s
            handled.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">7. Acceptable use</h2>
          <p>
            Don&rsquo;t use automated tools to create accounts or scrape the Service, attempt to access another
            user&rsquo;s data, or interfere with the Service&rsquo;s normal operation.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">8. Service &ldquo;as is&rdquo;</h2>
          <p>
            Project Hulk is provided &ldquo;as is,&rdquo; without warranties of any kind. We don&rsquo;t guarantee
            the Service will be uninterrupted, error-free, or that any calculation, estimate, or coach report will
            be accurate. To the fullest extent permitted by law, we aren&rsquo;t liable for any damages arising from
            your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">9. Termination</h2>
          <p>
            You can stop using the Service and delete your account at any time from Profile settings. We may
            suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">10. Changes to these terms</h2>
          <p>
            We may update these terms as the Service changes. We&rsquo;ll update the &ldquo;Last updated&rdquo; date
            above when we do; continuing to use the Service after a change means you accept the update.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold">11. Contact</h2>
          <p>
            Questions about these terms? Reach out at{" "}
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
