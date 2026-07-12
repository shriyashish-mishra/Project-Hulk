import { ChevronRight } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IdentityBodyDrawer } from "@/components/profile/identity-body-drawer";
import { GoalTrainingDrawer } from "@/components/profile/goal-training-drawer";
import { TargetsDrawer } from "@/components/profile/targets-drawer";
import { PreferencesDrawer } from "@/components/profile/preferences-drawer";
import { DeleteDataDrawer } from "@/components/profile/delete-data-drawer";
import { logOut } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/profile/context";
import { cmToFeetInches, kgToLb } from "@/lib/profile/units";
import { formatDuration } from "@/lib/date";
import {
  ACTIVITY_LEVEL_LABEL,
  PRIMARY_GOAL_LABEL,
  TRAINING_FREQUENCY_LABEL,
} from "@/lib/profile/types";
import { requireOnboardedUser } from "@/lib/supabase/auth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SectionButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="flex w-full flex-col gap-3 py-1 text-left active:opacity-60">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {title}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex flex-col divide-y divide-border">{children}</div>
    </button>
  );
}

function formatHeight(heightCm: number | null, isImperial: boolean): string {
  if (!heightCm) return "Not set";
  if (!isImperial) return `${heightCm} cm`;
  const { feet, inches } = cmToFeetInches(heightCm);
  return `${feet}'${inches}"`;
}

function formatWeight(weightKg: number | null, isImperial: boolean): string {
  if (!weightKg) return "Not logged yet";
  if (!isImperial) return `${weightKg} kg`;
  return `${Math.round(kgToLb(weightKg) * 10) / 10} lb`;
}

export default async function ProfilePage() {
  const { user } = await requireOnboardedUser();
  const context = await getUserContext();
  const profile = context.profile!;
  const isImperial = profile.units_preference === "imperial";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/more" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Profile
        </h1>
      </div>

      <Card className="animate-fade-up">
        <CardContent>
          <IdentityBodyDrawer
            profile={profile}
            trigger={
              <SectionButton title="You">
                <Row label="Name" value={profile.display_name || "—"} />
                <Row label="Age" value={context.age !== null ? `${context.age}` : "—"} />
                <Row
                  label="Biological sex"
                  value={profile.biological_sex === "male" ? "Male" : profile.biological_sex === "female" ? "Female" : "—"}
                />
                <Row label="Height" value={formatHeight(profile.height_cm, isImperial)} />
                <Row label="Latest weight" value={formatWeight(context.latestWeightKg, isImperial)} />
              </SectionButton>
            }
          />
        </CardContent>
      </Card>

      <Card className="animate-fade-up" style={{ animationDelay: "50ms" }}>
        <CardContent>
          <GoalTrainingDrawer
            profile={profile}
            trigger={
              <SectionButton title="Goal & Training">
                <Row label="Goal" value={profile.primary_goal ? PRIMARY_GOAL_LABEL[profile.primary_goal] : "—"} />
                <Row
                  label="Target weight"
                  value={profile.target_weight_kg ? formatWeight(profile.target_weight_kg, isImperial) : "Not set"}
                />
                <Row label="Activity level" value={profile.activity_level ? ACTIVITY_LEVEL_LABEL[profile.activity_level] : "—"} />
                <Row
                  label="Training frequency"
                  value={profile.training_frequency ? TRAINING_FREQUENCY_LABEL[profile.training_frequency] : "—"}
                />
              </SectionButton>
            }
          />
        </CardContent>
      </Card>

      <Card className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <CardContent>
          <TargetsDrawer
            profile={profile}
            latestWeightKg={context.latestWeightKg}
            trigger={
              <SectionButton title="Targets">
                <Row label="Protein" value={context.proteinTargetG ? `${context.proteinTargetG}g` : "Not enough info yet"} />
                <Row
                  label="Calories"
                  value={context.calorieRangeKcal ? `${context.calorieRangeKcal.min}–${context.calorieRangeKcal.max} kcal` : "Not enough info yet"}
                />
                <Row label="Hydration" value={context.hydrationTargetGlasses ? `${context.hydrationTargetGlasses} glasses` : "—"} />
                <Row label="Sleep" value={context.sleepTargetMinutes ? formatDuration(context.sleepTargetMinutes) : "—"} />
              </SectionButton>
            }
          />
        </CardContent>
      </Card>

      <Card className="animate-fade-up" style={{ animationDelay: "150ms" }}>
        <CardContent>
          <PreferencesDrawer
            profile={profile}
            trigger={
              <SectionButton title="Preferences">
                <Row label="Units" value={isImperial ? "Imperial" : "Metric"} />
              </SectionButton>
            }
          />
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Account
        </p>
        <Card className="animate-fade-up">
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <form action={logOut}>
              <Button type="submit" variant="outline" className="w-full">
                Log out
              </Button>
            </form>
            <DeleteDataDrawer
              trigger={
                <Button type="button" variant="ghost" className="w-full text-destructive hover:text-destructive">
                  Delete my data
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
