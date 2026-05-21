/**
 * Patch Node's module resolver so `import "server-only"` resolves to
 * the no-op `empty.js` shipped inside the `server-only` package
 * instead of `index.js` (which throws on purpose to catch accidental
 * client-side imports).
 *
 * Import this BEFORE any other module that pulls in server-only code,
 * e.g. before importing anything from `@/features/*`.
 *
 * This file is test-only — production code should never import it.
 */

import { existsSync } from "node:fs";
import { Module } from "node:module";
import { join } from "node:path";

type ResolveFn = (
  request: string,
  parent: NodeJS.Module | null,
  ...rest: unknown[]
) => string;

// The `server-only` package's `exports` map exposes only `.`, so we
// can't resolve `./empty.js` or even `./package.json` through Node's
// resolver. Fall back to walking up from cwd until we find the file
// inside a `node_modules/server-only/` directory.
function findEmptyStub(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    const candidate = join(dir, "node_modules", "server-only", "empty.js");
    if (existsSync(candidate)) return candidate;
    const parent = join(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "mock-server-only: could not locate node_modules/server-only/empty.js. Is the package installed?",
  );
}

const EMPTY_STUB_PATH = findEmptyStub();

// `_resolveFilename` is internal API but stable across Node majors and
// the standard interception point used by transpiler hooks.
const ModuleAny = Module as unknown as { _resolveFilename: ResolveFn };
const original = ModuleAny._resolveFilename;

ModuleAny._resolveFilename = function patched(
  this: unknown,
  request: string,
  parent: NodeJS.Module | null,
  ...rest: unknown[]
): string {
  if (request === "server-only") {
    return EMPTY_STUB_PATH;
  }
  return original.call(this, request, parent, ...rest);
};
