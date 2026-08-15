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
    <div className="flex flex-col gap-0.5 rounded-2xl bg-muted p-3.5">
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
  const hasRecovery = report.recovery_score !== undefined;

  return (
    <div className="flex flex-col gap-3">
      <Card className="animate-fade-up">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <ScoreBadge score={report.overall_score} size="lg" />
            <p className="text-sm text-muted-foreground">{report.coach_summary}</p>
          </div>
          <div className="flex flex-col gap-4">
            <ScoreMeter label="Nutrition" score={report.nutrition_score} />
            <ScoreMeter label="Workout" score={report.workout_score} />
            {hasRecovery && <ScoreMeter label="Recovery" score={report.recovery_score!} />}
          </div>
          {report.recovery_note && (
            <p className="text-sm text-muted-foreground">{report.recovery_note}</p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
        <CardHeader>
          <CardTitle>Nutrition Breakdown</CardTitle>
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
            <MacroTile label="Protein" value={report.protein_g} unit="g" />
            <MacroTile label="Carbs" value={report.carbs_g} unit="g" />
            <MacroTile label="Fat" value={report.fat_g} unit="g" />
            <MacroTile label="Fibre" value={report.fiber_g} unit="g" />
          </div>
          {report.meal_breakdown && report.meal_breakdown.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {report.meal_breakdown.map((meal) => (
                <li key={meal.meal_type} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span>{mealLabelByType.get(meal.meal_type) ?? meal.meal_type}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {meal.estimated_calories} kcal
                    <span className="ml-1.5">
                      P{meal.protein_g} · C{meal.carbs_g} · F{meal.fat_g}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
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

      <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle>Workout Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(report.workout_duration_min != null || report.workout_calories_burned != null) && (
            <div className="grid grid-cols-2 gap-3">
              {report.workout_duration_min != null && (
                <MacroTile label="Duration" value={report.workout_duration_min} unit="min" />
              )}
              {report.workout_calories_burned != null && (
                <MacroTile label="Calories Burned" value={report.workout_calories_burned} unit="kcal" />
              )}
            </div>
          )}
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
          {report.workout_exercises && report.workout_exercises.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {report.workout_exercises.map((exercise, index) => (
                <li key={index} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span>
                    {exercise.name}
                    {exercise.detail && (
                      <span className="ml-1.5 text-xs text-muted-foreground">{exercise.detail}</span>
                    )}
                  </span>
                  {exercise.calories_burned != null && (
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {exercise.calories_burned} kcal
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {report.photo_comparison_note && (
        <Card className="animate-fade-up" style={{ animationDelay: "180ms" }}>
          <CardHeader>
            <CardTitle>Progress Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {report.photo_comparison_note}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <CardHeader>
          <CardTitle>What Went Well</CardTitle>
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

      <Card className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <CardTitle>What Could Improve</CardTitle>
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

      <Card className="animate-fade-up" style={{ animationDelay: "360ms" }}>
        <CardHeader>
          <CardTitle>Tomorrow&rsquo;s Nutrition Plan</CardTitle>
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

      <Card className="animate-fade-up" style={{ animationDelay: "420ms" }}>
        <CardHeader>
          <CardTitle>Tomorrow&rsquo;s Workout Suggestion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {report.tomorrow_workout}
          </p>
          {report.tomorrow_workout_exercises && report.tomorrow_workout_exercises.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {report.tomorrow_workout_exercises.map((exercise, index) => (
                <li key={index} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span>
                    {exercise.name}
                    {exercise.detail && (
                      <span className="ml-1.5 text-xs text-muted-foreground">{exercise.detail}</span>
                    )}
                  </span>
                  {exercise.calories_burned != null && (
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {exercise.calories_burned} kcal
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
