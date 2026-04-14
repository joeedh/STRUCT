export declare function tab(n: number, chr?: string): string;
export declare const termColorMap: Record<string | number, string | number>;
export declare function termColor(s: string | symbol, c: string | number): string;
export declare function termPrint(...args: unknown[]): string;
export declare function list<T>(iter: Iterable<T>): T[];
