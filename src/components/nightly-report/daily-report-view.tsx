import { Check, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MEAL_SECTIONS } from "@/lib/food-logs/constants";
import type { AiReportJson } from "@/lib/nightly-report/types";
import { ScoreBadge } from "./score-badge";
import { ScoreMeter } from "./score-meter";

interface MacroTileProps {
  label: string;
  value: number;
  unit: string;
}

function MacroTile({ label, value, unit }: MacroTileProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">
          {unit}
        </span>
      </span>
    </div>
  );
}

interface DailyReportViewProps {
  report: AiReportJson;
}

export function DailyReportView({ report }: DailyReportViewProps) {
  const mealLabelByType = new Map(
    MEAL_SECTIONS.map((section) => [section.type, section.label]),
  );

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardContent className="flex items-center gap-4">
          <ScoreBadge score={report.overall_score} size="lg" />
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-sm font-medium">🏆 Overall Score</p>
            <p className="text-sm text-muted-foreground">{report.coach_summary}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <ScoreMeter label="Nutrition" score={report.nutrition_score} />
          <ScoreMeter label="Workout" score={report.workout_score} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔥 Nutrition Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <MacroTile
              label="Calories"
              value={report.estimated_calories}
              unit="kcal"
            />
            <p className="ml-3 shrink-0 text-sm text-muted-foreground">
              {report.calorie_balance}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MacroTile label="🥩 Protein" value={report.protein_g} unit="g" />
            <MacroTile label="🍚 Carbs" value={report.carbs_g} unit="g" />
            <MacroTile label="🥑 Fat" value={report.fat_g} unit="g" />
            <MacroTile label="Fibre" value={report.fiber_g} unit="g" />
          </div>
          {report.micronutrients.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {report.micronutrients.map((note) => (
                <li
                  key={note.name}
                  className="flex items-center justify-between gap-2 py-1.5 text-sm"
                >
                  <span>
                    {note.name}
                    {note.note && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {note.note}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium capitalize",
                      note.status === "low" ? "text-warning" : "text-success",
                    )}
                  >
                    {note.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💪 Workout Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {report.muscles_trained.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {report.muscles_trained.map((muscle) => (
                <Badge key={muscle} variant="secondary">
                  {muscle}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No workout logged.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>😊 What Went Well</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {report.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠️ What Could Improve</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {report.improvements.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🍽 Tomorrow&rsquo;s Nutrition Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {report.tomorrow_meals.map((meal) => (
              <li key={meal.meal_type} className="flex flex-col gap-0.5 py-2 text-sm">
                <span className="font-medium">
                  {mealLabelByType.get(meal.meal_type) ?? meal.meal_type}
                </span>
                <span className="text-muted-foreground">{meal.suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏋️ Tomorrow&rsquo;s Workout Suggestion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {report.tomorrow_workout}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
