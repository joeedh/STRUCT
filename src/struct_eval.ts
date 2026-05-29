export let structEval: (code: string) => unknown = eval;

export function setStructEval(val: (code: string) => unknown): void {
  structEval = val;
}
