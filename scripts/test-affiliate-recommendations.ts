/**
 * End-to-end test harness for the affiliate-recommendation classifier.
 *
 * Loads cases from scripts/test-cases/affiliate-recommendations.json,
 * calls the REAL `detectProductContext` (Anthropic Haiku) +
 * `selectAffiliateRecommendation` (Sanity lookup), and reports
 * accuracy with a pass/fail verdict.
 *
 * ⚠️  RUNS LIVE API CALLS — costs roughly $0.05-0.10 in Haiku tokens
 *     per full run (40 classifier calls). Plus a Sanity GROQ per
 *     positive case. Don't loop it in CI.
 *
 * Usage:
 *   npx tsx scripts/test-affiliate-recommendations.ts
 *
 * Requires .env.local with ANTHROPIC_API_KEY + SANITY_PROJECT_ID +
 * SANITY_DATASET + SANITY_API_VERSION.
 */

// MUST be first: patches Node's module resolver so `import "server-only"`
// resolves to a no-op stub. Without this, importing any feature module
// that uses `import "server-only"` throws when run via `npx tsx` outside
// of Next.js. Test-only — does not touch production code.
import "./test-helpers/mock-server-only";

import { config } from "dotenv";
// override:true is needed because the OS / shell may pre-set some keys
// (e.g. ANTHROPIC_API_KEY="") which would otherwise win over .env.local
// and make the classifier think no key is configured.
config({ path: ".env.local", override: true });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { detectProductContext } from "@/features/affiliate-products/server/detect-product-context";
import { selectAffiliateRecommendation } from "@/features/affiliate-products/server/select-recommendation";

// ── Shapes ──────────────────────────────────────────────────────────

type TestCase = {
  id: string;
  brand: string;
  user_message: string;
  turn_count: number;
  expected_product_slug: string | null;
  expected_brand: string | null;
  reasoning: string;
};

type TestCasesFile = {
  cases: TestCase[];
};

type CaseResult = {
  testCase: TestCase;
  actualSlug: string | null;
  actualBrand: string | null;
  passed: boolean;
  /** When passed=false this explains what diverged. */
  divergence: string | null;
  durationMs: number;
  detectionReason?: string;
};

// ── Helpers ─────────────────────────────────────────────────────────

function loadTestCases(): TestCase[] {
  const path = resolve(__dirname, "test-cases/affiliate-recommendations.json");
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as TestCasesFile;
  if (!Array.isArray(parsed.cases) || parsed.cases.length === 0) {
    throw new Error(`No test cases found at ${path}`);
  }
  return parsed.cases;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function symbol(passed: boolean): string {
  return passed ? "✓" : "✗";
}

async function runCase(testCase: TestCase): Promise<CaseResult> {
  const started = Date.now();

  // Provide a single-user "current message" recentMessages array so the
  // classifier sees the message in context. Selection uses a synthetic
  // session id — no dismissals exist in a fresh test session, so the
  // selector behaves as if every product is available.
  const detection = await detectProductContext({
    userMessage: testCase.user_message,
    recentMessages: [
      {
        id: `case-${testCase.id}-user`,
        sessionId: `test-session-${testCase.id}`,
        role: "user",
        content: testCase.user_message,
        createdAt: new Date().toISOString(),
      },
    ],
    turnCount: testCase.turn_count,
  });

  let actualSlug: string | null = null;
  let actualBrand: string | null = null;

  if (detection.shouldRecommend) {
    const card = await selectAffiliateRecommendation({
      detection,
      sessionId: `test-session-${testCase.id}`,
    });
    if (card) {
      actualSlug = card.slug;
      actualBrand = card.brand;
    }
  }

  // Pass condition: actual matches expected on both slug AND brand.
  // For null-expected cases (safety / out-of-domain), actual must be null.
  const slugMatches = actualSlug === testCase.expected_product_slug;
  const brandMatches = actualBrand === testCase.expected_brand;
  const passed = slugMatches && brandMatches;

  let divergence: string | null = null;
  if (!passed) {
    if (testCase.expected_product_slug === null && actualSlug !== null) {
      divergence = `expected no recommendation, got ${actualBrand}/${actualSlug}`;
    } else if (testCase.expected_product_slug !== null && actualSlug === null) {
      divergence = `expected ${testCase.expected_brand}/${testCase.expected_product_slug}, got nothing (reason: ${detection.reason ?? "no_match"})`;
    } else {
      divergence = `expected ${testCase.expected_brand}/${testCase.expected_product_slug}, got ${actualBrand}/${actualSlug}`;
    }
  }

  return {
    testCase,
    actualSlug,
    actualBrand,
    passed,
    divergence,
    durationMs: Date.now() - started,
    detectionReason: detection.reason,
  };
}

function classifyVerdict(accuracyPct: number): {
  label: string;
  guidance: string;
  code: number;
} {
  if (accuracyPct >= 80) {
    return {
      label: "PASS",
      guidance: "Ship it. Spot-check the false positives/negatives below before launch but the classifier is healthy.",
      code: 0,
    };
  }
  if (accuracyPct >= 60) {
    return {
      label: "REVIEW",
      guidance: "Acceptable but worth tuning. Review each false positive/negative — usually the fix is adding a keyword to the Sanity product or tightening a context tag.",
      code: 0,
    };
  }
  return {
    label: "FAIL",
    guidance: "Classifier or product catalog needs work before shipping. Check that products are isActive=true and that their contexts + keywords cover the real user vocabulary.",
    code: 1,
  };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const cases = loadTestCases();
  const brandsCovered = new Set(cases.map((c) => c.brand));
  console.log(
    `Running ${cases.length} test cases across ${brandsCovered.size} brand(s)…\n`,
  );
  console.log(
    "⚠️  Live Anthropic Haiku calls. Estimated cost: $0.05-0.10 for a full run.\n",
  );

  const results: CaseResult[] = [];
  let index = 0;
  for (const testCase of cases) {
    index += 1;
    process.stdout.write(`[${index.toString().padStart(2, "0")}/${cases.length}] ${testCase.id} … `);
    try {
      const result = await runCase(testCase);
      results.push(result);
      process.stdout.write(`${symbol(result.passed)} (${result.durationMs} ms)\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      console.log(`✗ ERROR: ${message}`);
      results.push({
        testCase,
        actualSlug: null,
        actualBrand: null,
        passed: false,
        divergence: `error: ${message}`,
        durationMs: 0,
      });
    }
  }

  // ── Report ─────────────────────────────────────────────────────
  console.log("\n────────────────────────────────────────────────────────");
  console.log("  RESULTS");
  console.log("────────────────────────────────────────────────────────");
  console.log(
    "  #   id                          message                                expected             actual               ✓/✗",
  );
  console.log(
    "  ─── ─────────────────────────── ──────────────────────────────────────  ─────────────────── ─────────────────── ─",
  );

  for (let i = 0; i < results.length; i += 1) {
    const r = results[i];
    const exp = r.testCase.expected_product_slug ?? "—(none)";
    const act = r.actualSlug ?? "—(none)";
    console.log(
      `  ${(i + 1).toString().padStart(3, "0")} ${r.testCase.id.padEnd(28)} ${truncate(r.testCase.user_message, 38).padEnd(40)} ${truncate(exp, 19).padEnd(20)} ${truncate(act, 19).padEnd(20)} ${symbol(r.passed)}`,
    );
  }

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  // False positives: classifier recommended when it shouldn't have, OR
  // recommended a different brand than expected (for null-expected
  // cases, treated as "shouldn't have recommended at all").
  const falsePositives = failed.filter(
    (r) =>
      (r.testCase.expected_product_slug === null && r.actualSlug !== null) ||
      (r.testCase.expected_product_slug !== null &&
        r.actualSlug !== null &&
        r.actualSlug !== r.testCase.expected_product_slug),
  );
  // False negatives: classifier missed a recommendation that was expected.
  const falseNegatives = failed.filter(
    (r) => r.testCase.expected_product_slug !== null && r.actualSlug === null,
  );

  const accuracyPct = (passed.length / results.length) * 100;
  const verdict = classifyVerdict(accuracyPct);

  console.log("\n────────────────────────────────────────────────────────");
  console.log("  SUMMARY");
  console.log("────────────────────────────────────────────────────────");
  console.log(`  Total cases:       ${results.length}`);
  console.log(`  Passed:            ${passed.length}`);
  console.log(`  Failed:            ${failed.length}`);
  console.log(`  Accuracy:          ${accuracyPct.toFixed(1)}%`);
  console.log(`  Brands covered:    ${brandsCovered.size} (${[...brandsCovered].join(", ")})`);
  console.log("");
  console.log(`  False positives:   ${falsePositives.length}`);
  console.log(`  False negatives:   ${falseNegatives.length}`);
  console.log("");
  console.log(`  VERDICT: ${verdict.label}`);
  console.log(`  ${verdict.guidance}`);

  if (falsePositives.length > 0) {
    console.log("\n  ── False positives ───────────────────────────────────");
    for (const r of falsePositives) {
      console.log(`    • ${r.testCase.id}: ${r.divergence}`);
      console.log(`      msg: ${truncate(r.testCase.user_message, 80)}`);
    }
  }
  if (falseNegatives.length > 0) {
    console.log("\n  ── False negatives ───────────────────────────────────");
    for (const r of falseNegatives) {
      console.log(`    • ${r.testCase.id}: ${r.divergence}`);
      console.log(`      msg: ${truncate(r.testCase.user_message, 80)}`);
    }
  }
  console.log("");

  process.exit(verdict.code);
}

main().catch((error) => {
  console.error("Fatal:", error);
  process.exit(2);
});
