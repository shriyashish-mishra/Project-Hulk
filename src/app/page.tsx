import { Dumbbell, Scale, UtensilsCrossed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SUMMARY_CARDS = [
  {
    key: "meals",
    title: "Meals",
    icon: UtensilsCrossed,
    empty: "No meals logged today.",
  },
  {
    key: "workouts",
    title: "Workout",
    icon: Dumbbell,
    empty: "No workout logged today.",
  },
  {
    key: "weight",
    title: "Weight",
    icon: Scale,
    empty: "No weigh-in logged today.",
  },
] as const;

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        {SUMMARY_CARDS.map(({ key, title, icon: Icon, empty }) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>{empty}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nightly report</CardTitle>
          <CardDescription>
            Generate a report to analyze in Claude, then import the results
            back once ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not available yet — arrives in a future milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
