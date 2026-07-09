import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SummaryCardsProps {
  caloriesConsumed: number;
  proteinConsumed: number;
  remainingCalories: number;
  remainingProtein: number;
  caloriesProgress: number;
  proteinProgress: number;
}

export function SummaryCards({
  caloriesConsumed,
  proteinConsumed,
  remainingCalories,
  remainingProtein,
  caloriesProgress,
  proteinProgress,
}: SummaryCardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Calories</span>
            <span className="text-muted-foreground">
              {caloriesConsumed} kcal ·{" "}
              <span className={remainingCalories < 0 ? "text-destructive" : ""}>
                {remainingCalories >= 0
                  ? `${remainingCalories} left`
                  : `${Math.abs(remainingCalories)} over`}
              </span>
            </span>
          </div>
          <Progress value={caloriesProgress} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Protein</span>
            <span className="text-muted-foreground">
              {proteinConsumed.toFixed(0)}g ·{" "}
              <span className={remainingProtein < 0 ? "text-destructive" : ""}>
                {remainingProtein >= 0
                  ? `${remainingProtein.toFixed(0)}g left`
                  : `${Math.abs(remainingProtein).toFixed(0)}g over`}
              </span>
            </span>
          </div>
          <Progress value={proteinProgress} />
        </div>
      </CardContent>
    </Card>
  );
}
