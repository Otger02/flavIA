// NOTE: deliberately NOT `"server-only"` — this is pure logic over
// static constants (no DB, no env, no IO) and is imported by the
// client-side onboarding screen as well as future server callers.

import {
  GENERIC_SUGGESTED_PROMPTS,
  SUGGESTED_PROMPTS_BY_TOPIC,
  type OnboardingTopic,
} from "@/features/onboarding/constants";

const MAX_SUGGESTIONS = 3;

/**
 * Returns 3 conversation starters for screen 3 (and for future
 * "suggestions" surfaces). Picks 1 prompt from each chosen topic in
 * order, falling back to the topic's other prompts if we need to
 * fill, then to GENERIC_SUGGESTED_PROMPTS as final padding.
 *
 * Deterministic — pulls index 0 of each topic's list — so the same
 * topic selection always yields the same suggestions. That matters
 * for screen 3 layout stability when the user navigates back/forward.
 */
export function getSuggestedPrompts(topics: readonly string[]): string[] {
  const valid = topics.filter((t): t is OnboardingTopic =>
    Object.prototype.hasOwnProperty.call(SUGGESTED_PROMPTS_BY_TOPIC, t),
  );

  if (valid.length === 0) {
    return [...GENERIC_SUGGESTED_PROMPTS].slice(0, MAX_SUGGESTIONS);
  }

  const seen = new Set<string>();
  const out: string[] = [];

  // Round 1: take the first prompt of each topic (most "canonical").
  for (const topic of valid) {
    const prompts = SUGGESTED_PROMPTS_BY_TOPIC[topic];
    const first = prompts[0];
    if (first && !seen.has(first)) {
      seen.add(first);
      out.push(first);
      if (out.length === MAX_SUGGESTIONS) return out;
    }
  }

  // Round 2: pad with subsequent prompts of the same topics.
  for (const topic of valid) {
    for (const prompt of SUGGESTED_PROMPTS_BY_TOPIC[topic].slice(1)) {
      if (!seen.has(prompt)) {
        seen.add(prompt);
        out.push(prompt);
        if (out.length === MAX_SUGGESTIONS) return out;
      }
    }
  }

  // Round 3: generic fillers if the user picked only 1 topic with <3 prompts.
  for (const prompt of GENERIC_SUGGESTED_PROMPTS) {
    if (!seen.has(prompt)) {
      seen.add(prompt);
      out.push(prompt);
      if (out.length === MAX_SUGGESTIONS) return out;
    }
  }

  return out;
}
