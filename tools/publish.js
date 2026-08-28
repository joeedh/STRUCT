/**
 * Release driver: build the package tree, publish it to npm, and tag the
 * release.
 *
 * `node tools/publish.js [--dry-run] [--skip-git] [--skip-login]`. A dry run
 * still builds and assembles package/ and still runs `npm publish --dry-run`
 * for the tarball listing, but makes no commit, tag, push, or upload.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { buildPackage, capture, fail, root, run } from "./build_package.js";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const dry = process.argv.includes("--dry-run");
const skipGit = process.argv.includes("--skip-git");
const skipLogin = dry || process.argv.includes("--skip-login");

function publish() {
  const { version } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  console.log((dry ? "Dry run for " : "Publishing ") + version);

  buildPackage(false);

  if (!skipGit) {
    // A release script that opens an editor cannot run unattended, so an
    // unclean tree is an error rather than something to commit here.
    if (capture(["git", "status", "--porcelain"]) !== "") {
      throw new Error("\nERROR: working tree is dirty; commit or stash before publishing\n");
    }

    run(dry, ["git", "pull", "--ff-only"]);
  }

  if (!skipLogin) {
    run(false, [npm, "login"], { shell: true });
  }

  run(false, [npm, "publish", "--access", "public", ...(dry ? ["--dry-run"] : [])], {
    cwd  : path.join(root, "package"),
    shell: true,
  });

  if (!skipGit) {
    run(dry, ["git", "tag", "-a", version, "-m", "Release " + version]);
    run(dry, ["git", "push"]);
    run(dry, ["git", "push", "--tags"]);
  }

  console.log(dry ? "dry run complete; nothing was published" : "published " + version);
}

try {
  publish();
} catch (error) {
  fail(error);
}
