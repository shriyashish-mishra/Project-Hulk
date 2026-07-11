/**
 * Male variant of the same hand-crafted silhouette family — same viewBox,
 * same smooth cubic-bezier drawing style, same head/neck/limb/hand/foot
 * geometry as the female asset (silhouette-paths.ts). Only the torso is
 * redrawn: broader shoulders and a reduced waist/hip taper (a straighter
 * V-taper rather than an hourglass), per the brief's explicit instruction —
 * no bodybuilder proportions, no medical-textbook styling, still the same
 * abstract rounded-shape figure, just a different variant of it.
 * viewBox "0 0 300 620".
 */

import {
  BODY_VIEWBOX,
  FOOT_L,
  FOOT_R,
  HAND_L,
  HAND_R,
  HEAD,
  LEFT_ARM,
  LEFT_LEG,
  NECK,
  RIGHT_ARM,
  RIGHT_LEG,
} from "./silhouette-paths";

export { BODY_VIEWBOX };

export const TORSO_MALE =
  "M150,100 C182,98 210,108 212,128 C208,146 208,160 204,172 C198,190 188,212 182,232 C178,252 184,268 188,282 C190,292 186,298 180,303 C172,307 160,308 150,308 C140,308 128,307 120,303 C114,298 110,292 112,282 C116,268 122,252 118,232 C112,212 102,190 96,172 C92,160 92,146 88,128 C90,108 118,98 150,100 Z";

/** Non-highlightable structural pieces — everything but the torso is shared with the female asset. */
export const SILHOUETTE_PIECES_MALE: string[] = [
  TORSO_MALE,
  RIGHT_ARM,
  LEFT_ARM,
  RIGHT_LEG,
  LEFT_LEG,
  HEAD,
  NECK,
  HAND_R,
  HAND_L,
  FOOT_R,
  FOOT_L,
];
