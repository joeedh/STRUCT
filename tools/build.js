/**
 * esbuild driver for every bundle in build/.
 *
 * Run with `pnpm build`, or `node tools/build.js <name> ...` to build a subset.
 * `--no-types` skips the `tsc` declaration pass.
 */

import * as esbuild from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = "es2020";

const TINYEVAL_START = "//$BUILD_TINYEVAL_START";
const TINYEVAL_END = "//$BUILD_TINYEVAL_END";
const KEYWORD_START = "//$KEYWORD_CONFIG_START";
const KEYWORD_END = "//$KEYWORD_CONFIG_END";

function read(rel) {
  return readFileSync(path.join(root, rel), "utf8");
}

/** Split `source` around a marker pair into the text before, between, and after. */
function cut(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end);

  if (a < 0 || b < 0) {
    throw new Error("missing marker: " + (a < 0 ? start : end));
  }

  return [source.slice(0, a), source.slice(a + start.length, b), source.slice(b + end.length)];
}

/** Escape transpiled source for embedding in a template literal. */
function escapeTemplate(js) {
  return js.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

/**
 * Drop the tinyeval import and export no-op stand-ins. Bundles built this way
 * keep the `tinyeval` and `useTinyEval` exports that structjs.d.ts declares.
 */
function stripTinyeval(source, file) {
  if (path.basename(file) !== "structjs.ts") {
    return source;
  }

  const [pre, , post] = cut(source, TINYEVAL_START, TINYEVAL_END);
  return pre + "\nexport const tinyeval = undefined;\nexport function useTinyEval(): void {}\n" + post;
}

/** Compile the keyword indirection out into direct property accesses. */
function inlineKeywords(source) {
  const pairs = [
    ["[keywords.script]", ".STRUCT"],
    ["[keywords.load]", ".loadSTRUCT"],
    ["[keywords.new]", ".newSTRUCT"],
    ["[keywords.from]", ".fromSTRUCT"],
    ["[keywords.migrate]", ".migrateSTRUCT"],
    ["[keywords.getVersion]", ".getVersionSTRUCT"],
    ["[keywords.name]", ".structName"],
  ];

  for (const [from, to] of pairs) {
    source = source.split(from).join(to);
  }

  return source;
}

/**
 * Move the STRUCT class into a template literal so a consumer can re-evaluate
 * it against its own keyword set. The class is transpiled on its own at a
 * target with native static fields, so the string stays free of the class-field
 * helper esbuild would otherwise reference from the surrounding scope.
 */
function templatizeStruct(source, file) {
  if (path.basename(file) !== "struct_intern.ts") {
    return source;
  }

  const [pre, body, post] = cut(source, KEYWORD_START, KEYWORD_END);

  if (!body.includes("export class STRUCT")) {
    throw new Error("struct_intern.ts no longer declares `export class STRUCT` between the keyword markers");
  }

  const cls = body.replace("export class STRUCT", "StructClass = class StructClass");
  const js = esbuild.transformSync(cls, {
    loader     : "ts",
    target     : "es2022",
    tsconfigRaw: { compilerOptions: { useDefineForClassFields: false } },
  }).code;

  return pre + "export let STRUCT;\nconst code = `" + escapeTemplate(js) + "`;\nhaveCodeGen = true;\n" + post;
}

function sourcePlugin(transforms) {
  return {
    name: "nstructjs-source",
    setup(build) {
      build.onLoad({ filter: /\.[cm]?ts$/ }, (args) => {
        if (args.path.includes("node_modules")) {
          return null;
        }

        let source = readFileSync(args.path, "utf8");

        for (const transform of transforms) {
          source = transform(source, args.path);
        }

        return { contents: source, loader: "ts" };
      });
    },
  };
}

const startFrag = read("tools/start.frag");
const endFrag = read("tools/end.frag");

const BUNDLES = {
  "nstructjs-jest.js": {
    entry     : "src/structjs.ts",
    format    : "cjs",
    transforms: [stripTinyeval],
    wrap      : false,
  },
  "nstructjs.js": {
    entry     : "src/structjs.ts",
    format    : "cjs",
    transforms: [stripTinyeval],
    wrap      : true,
  },
  "nstructjs_tinyeval.js": {
    entry     : "src/structjs.ts",
    format    : "cjs",
    transforms: [],
    wrap      : true,
  },
  "tinyeval.js": {
    entry     : "tinyeval/tinyeval.js",
    format    : "cjs",
    transforms: [],
  },
  "nstructjs_es6.js": {
    entry     : "src/structjs.ts",
    format    : "esm",
    transforms: [stripTinyeval, inlineKeywords],
  },
  "nstructjs_configurable.js": {
    entry     : "src/structjs.ts",
    format    : "esm",
    transforms: [stripTinyeval, templatizeStruct],
  },
  "nstructjs_configurable_noeval.js": {
    entry     : "src/structjs.ts",
    format    : "esm",
    transforms: [stripTinyeval],
  },
};

async function bundle(name, spec) {
  // The cjs bundles are the ones that pull in acorn through tinyeval, and the
  // node platform is also what keeps esbuild from emitting a top-level
  // `exports` binding that would shadow the one start.frag declares.
  const node = spec.format === "cjs";

  await esbuild.build({
    absWorkingDir: root,
    entryPoints  : [spec.entry],
    outfile      : path.join("build", name),
    bundle       : true,
    treeShaking  : false,
    format       : spec.format,
    platform     : node ? "node" : "neutral",
    mainFields   : node ? undefined : ["module", "main"],
    conditions   : node ? undefined : ["import", "module", "default"],
    target       : TARGET,
    charset      : "utf8",
    logLevel     : "warning",
    // The generated pack/unpack code is compiled with a direct eval on purpose.
    logOverride  : { "direct-eval": "silent" },
    banner       : spec.wrap ? { js: startFrag } : undefined,
    footer       : spec.wrap ? { js: endFrag } : undefined,
    plugins      : [sourcePlugin(spec.transforms)],
  });

  console.log("wrote build/" + name);
}

function emitDeclarations() {
  const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
  const result = spawnSync(process.execPath, [tsc, "-p", "tsconfig.json"], { cwd: root, stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error("tsc failed with status " + result.status);
  }

  console.log("wrote build/*.d.ts");
}

const args = process.argv.slice(2);
const names = args.filter((a) => !a.startsWith("--"));
const selected = names.length ? names : Object.keys(BUNDLES);

try {
  for (const name of selected) {
    if (!BUNDLES[name]) {
      throw new Error("unknown bundle " + name + "; known: " + Object.keys(BUNDLES).join(", "));
    }
  }

  mkdirSync(path.join(root, "build"), { recursive: true });

  for (const name of selected) {
    await bundle(name, BUNDLES[name]);
  }

  if (!args.includes("--no-types")) {
    emitDeclarations();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
