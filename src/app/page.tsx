import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FoodDashboard } from "@/components/food/food-dashboard";
import { WorkoutCard } from "@/components/workout/workout-card";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";

export default async function DashboardPage() {
  const loggedOn = getLocalDateString();
  const [logs, workoutLog] = await Promise.all([
    getFoodLogsForDate(loggedOn),
    getWorkoutLogForDate(loggedOn),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{formatDateHeading()}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="flex flex-col gap-3">
        <FoodDashboard initialLogs={logs} />
        <WorkoutCard initialLog={workoutLog} />
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
