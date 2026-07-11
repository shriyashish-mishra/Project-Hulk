/**
 * Internal region boundaries, traced against front-reference.png /
 * back-reference.png at 1:1 scale (see the asset pack README — the
 * source SVGs only contain the outer silhouette, no internal muscle
 * geometry). Each region is grouped under one logical muscle id so a
 * single intensity value can drive both the left and right instance.
 */

import type { MuscleGroupId } from "@/lib/progress/muscle-groups";

export type { MuscleGroupId };

export interface RegionPath {
  id: MuscleGroupId;
  view: "front" | "back";
  side: "left" | "right" | "center";
  d: string;
}

export const FRONT_REGION_PATHS: RegionPath[] = [
  { id: "shoulders", view: "front", side: "left", d: "M116,178 Q113,212 128,240 Q150,252 192,244 L190,180 Q158,170 116,178 Z" },
  { id: "shoulders", view: "front", side: "right", d: "M330,178 Q333,212 318,240 Q296,252 254,244 L256,180 Q288,170 330,178 Z" },
  { id: "chest", view: "front", side: "center", d: "M190,180 L223,203 L256,180 L253,248 Q223,258 193,248 Z" },
  { id: "core", view: "front", side: "center", d: "M196,250 L250,250 L247,384 L199,384 Z" },
  { id: "obliques", view: "front", side: "left", d: "M176,252 L196,250 L199,384 L182,388 Q171,320 176,252 Z" },
  { id: "obliques", view: "front", side: "right", d: "M270,252 L250,250 L247,384 L264,388 Q275,320 270,252 Z" },
  { id: "quadriceps", view: "front", side: "left", d: "M168,452 L223,452 L216,602 L179,608 Z" },
  { id: "quadriceps", view: "front", side: "right", d: "M278,452 L223,452 L230,602 L267,608 Z" },
  { id: "calves", view: "front", side: "left", d: "M180,655 L222,655 L214,766 L190,766 Z" },
  { id: "calves", view: "front", side: "right", d: "M266,655 L224,655 L232,766 L256,766 Z" },
  { id: "biceps", view: "front", side: "left", d: "M90,248 L136,250 L129,350 L96,352 Z" },
  { id: "biceps", view: "front", side: "right", d: "M356,248 L310,250 L317,350 L350,352 Z" },
  { id: "forearms", view: "front", side: "left", d: "M76,352 L128,352 L123,436 L84,436 Z" },
  { id: "forearms", view: "front", side: "right", d: "M370,352 L318,352 L323,436 L362,436 Z" },
];

export const BACK_REGION_PATHS: RegionPath[] = [
  { id: "shoulders", view: "back", side: "left", d: "M92,192 Q86,222 100,248 Q122,258 158,248 L155,190 Q124,180 92,192 Z" },
  { id: "shoulders", view: "back", side: "right", d: "M354,192 Q360,222 346,248 Q324,258 288,248 L291,190 Q322,180 354,192 Z" },
  { id: "upper_back", view: "back", side: "center", d: "M186,188 L223,168 L260,188 L252,222 L223,212 L194,222 Z" },
  { id: "lats", view: "back", side: "left", d: "M162,196 L188,224 L196,300 L172,312 Q150,250 162,196 Z" },
  { id: "lats", view: "back", side: "right", d: "M284,196 L258,224 L250,300 L274,312 Q296,250 284,196 Z" },
  { id: "lower_back", view: "back", side: "center", d: "M196,302 L250,302 L246,348 L200,348 Z" },
  { id: "glutes", view: "back", side: "left", d: "M172,350 L222,350 L222,432 L176,434 Q158,392 172,350 Z" },
  { id: "glutes", view: "back", side: "right", d: "M274,350 L224,350 L224,432 L270,434 Q288,392 274,350 Z" },
  { id: "hamstrings", view: "back", side: "left", d: "M172,444 L220,444 L214,606 L184,610 Z" },
  { id: "hamstrings", view: "back", side: "right", d: "M274,444 L226,444 L232,606 L262,610 Z" },
  { id: "calves", view: "back", side: "left", d: "M182,650 L220,650 L212,764 L190,764 Z" },
  { id: "calves", view: "back", side: "right", d: "M264,650 L226,650 L234,764 L256,764 Z" },
  { id: "triceps", view: "back", side: "left", d: "M88,250 L158,250 L152,352 L96,352 Z" },
  { id: "triceps", view: "back", side: "right", d: "M358,250 L288,250 L294,352 L350,352 Z" },
  { id: "forearms", view: "back", side: "left", d: "M76,354 L128,354 L123,436 L86,436 Z" },
  { id: "forearms", view: "back", side: "right", d: "M370,354 L318,354 L323,436 L360,436 Z" },
];
