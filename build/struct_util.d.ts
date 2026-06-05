/**
 * Marks a class auto-synthesized by `parse_structs` to stand in for a struct
 * that was missing from the registered class list (i.e. its real JS class isn't
 * loaded — typically an unloaded addon). When a host has installed an
 * `onUnknownClass` hook, the read path treats such a dummy as "unknown" so the
 * host's placeholder class is used and `_origClsname` is stamped, instead of
 * silently reading into the throwaway dummy. `null_natives` (register_null)
 * dummies are NOT flagged, so they keep their existing behavior.
 */
export declare const PARSE_STRUCTS_DUMMY: unique symbol;
/** True if `cls` is a `parse_structs`-synthesized placeholder (see above). */
export declare function isParseStructsDummy(cls: unknown): boolean;
export declare function tab(n: number, chr?: string): string;
export declare const termColorMap: Record<string | number, string | number>;
export declare function termColor(s: string | symbol, c: string | number): string;
export declare function termPrint(...args: unknown[]): string;
export declare function list<T>(iter: Iterable<T>): T[];
