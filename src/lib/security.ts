import { timingSafeEqual } from "crypto";

/** Constant-time string comparison so secret/token checks don't leak timing information. */
export function secureEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
