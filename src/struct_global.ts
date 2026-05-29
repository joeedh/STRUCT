declare const global: typeof globalThis | undefined;

export let nGlobal: typeof globalThis = globalThis;

if (typeof globalThis !== "undefined") {
  nGlobal = globalThis;
} else if (typeof window !== "undefined") {
  nGlobal = window;
} else if (typeof global !== "undefined") {
  nGlobal = global;
} else if (typeof self !== "undefined") {
  nGlobal = self as typeof globalThis;
}

export const DEBUG: Record<string, unknown> = {};

export function updateDEBUG(): void {
  for (const k of Object.keys(DEBUG)) {
    delete DEBUG[k];
  }

  const g = nGlobal as Record<string, unknown>;
  if (typeof g.DEBUG === "object" && g.DEBUG !== null) {
    const dbg = g.DEBUG as Record<string, unknown>;
    for (const k in dbg) {
      DEBUG[k] = dbg[k];
    }
  }
}
