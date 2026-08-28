/**
 * Assemble the publishable tree in package/.
 *
 * `node tools/build_package.js [--dry-run] [--no-build]`. A dry run reports
 * every step it would take and writes nothing.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Everything copied into package/, as [source, destination] relative to the repo root. */
const CONTENTS = [
  ["build", "package/build"],
  ["src", "package/src"],
  ["tinyeval/tinyeval.js", "package/tinyeval/tinyeval.js"],
  ["tests", "package/tests"],
  ["documentation", "package/docs"],
  ["package.json", "package/package.json"],
  ["README.md", "package/README.md"],
  ["LICENSE", "package/LICENSE"],
];

/** Runs a command, or describes it, and throws on a non-zero exit. */
export function run(dry, argv, options = {}) {
  if (dry) {
    console.log("[dry-run] " + argv.join(" "));
    return;
  }

  console.log("$ " + argv.join(" "));
  const result = spawnSync(argv[0], argv.slice(1), { cwd: root, stdio: "inherit", ...options });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(argv[0] + " exited with status " + result.status);
  }
}

/** Runs a command and returns its trimmed stdout, throwing on a non-zero exit. */
export function capture(argv) {
  const result = spawnSync(argv[0], argv.slice(1), { cwd: root, encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(argv.join(" ") + " exited with status " + result.status);
  }

  return result.stdout.trim();
}

export function buildPackage(dry, { build = true } = {}) {
  if (build) {
    run(dry, ["pnpm", "run", "build"], { shell: true });
  }

  for (const [from, to] of CONTENTS) {
    const src = path.join(root, from);
    const dest = path.join(root, to);

    if (!existsSync(src)) {
      throw new Error("missing " + from + "; run the build first");
    }

    if (dry) {
      console.log("[dry-run] copy " + from + " -> " + to);
      continue;
    }

    rmSync(dest, { recursive: true, force: true });
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log("copied " + from + " -> " + to);
  }
}

/** Reports the message without a stack trace and exits non-zero. */
export function fail(error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dry = process.argv.includes("--dry-run");

  try {
    buildPackage(dry, { build: !process.argv.includes("--no-build") });
  } catch (error) {
    fail(error);
  }

  console.log(dry ? "dry run complete; package/ untouched" : "package/ is ready");
}
