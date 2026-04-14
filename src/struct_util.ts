"use strict";

const colormap: Record<string, number> = {
  "black"   : 30,
  "red"     : 31,
  "green"   : 32,
  "yellow"  : 33,
  "blue"    : 34,
  "magenta" : 35,
  "cyan"    : 36,
  "white"   : 37,
  "reset"   : 0,
  "grey"    : 2,
  "orange"  : 202,
  "pink"    : 198,
  "brown"   : 314,
  "lightred": 91,
  "peach"   : 210,
};

export function tab(n: number, chr: string = " "): string {
  let t = "";

  for (let i = 0; i < n; i++) {
    t += chr;
  }

  return t;
}

export const termColorMap: Record<string | number, string | number> = {};
for (const k in colormap) {
  termColorMap[k] = colormap[k];
  termColorMap[colormap[k]] = k;
}

export function termColor(s: string | symbol, c: string | number): string {
  let str: string;
  if (typeof s === "symbol") {
    str = s.toString();
  } else {
    str = "" + s;
  }

  let code: number;
  if (typeof c === "string" && c in colormap) {
    code = colormap[c];
  } else {
    code = typeof c === "number" ? c : parseInt(c, 10);
  }

  if (code > 107) {
    const s2 = "\u001b[38;5;" + code + "m";
    return s2 + str + "\u001b[0m";
  }

  return "\u001b[" + code + "m" + str + "\u001b[0m";
}

interface TermToken {
  type: string;
  value: string;
}

export function termPrint(...args: unknown[]): string {
  let s = "";
  for (let i = 0; i < args.length; i++) {
    if (i > 0) {
      s += " ";
    }
    s += args[i];
  }

  const re1a = /\u001b\[[1-9][0-9]?m/;
  const re1b = /\u001b\[[1-9][0-9];[0-9][0-9]?;[0-9]+m/;
  const re2 = /\u001b\[0m/;

  const endtag = "\u001b[0m";

  function tok(s: string, type: string): TermToken {
    return {
      type : type,
      value: s,
    };
  }

  const tokdefs: [RegExp, string][] = [
    [re1a, "start"],
    [re1b, "start"],
    [re2, "end"],
  ];

  let s2 = s;
  const tokens: TermToken[] = [];

  while (s2.length > 0) {
    let ok = false;

    let mini: number | undefined = undefined;
    let minslice: string | undefined = undefined;
    let mintype: string | undefined = undefined;

    for (const tk of tokdefs) {
      const idx = s2.search(tk[0]);

      if (idx >= 0 && (mini === undefined || idx < mini)) {
        const match = s2.slice(idx, s2.length).match(tk[0]);
        if (match) {
          minslice = match[0];
          mini = idx;
          mintype = tk[1];
          ok = true;
        }
      }
    }

    if (!ok) {
      break;
    }

    if (mini! > 0) {
      const chunk = s2.slice(0, mini);
      tokens.push(tok(chunk, "chunk"));
    }

    s2 = s2.slice(mini! + minslice!.length, s2.length);
    const t = tok(minslice!, mintype!);

    tokens.push(t);
  }

  if (s2.length > 0) {
    tokens.push(tok(s2, "chunk"));
  }

  const stack: (string | undefined)[] = [];
  let cur: string | undefined;

  let out = "";

  for (const t of tokens) {
    if (t.type === "chunk") {
      out += t.value;
    } else if (t.type === "start") {
      stack.push(cur);
      cur = t.value;

      out += t.value;
    } else if (t.type === "end") {
      cur = stack.pop();
      if (cur) {
        out += cur;
      } else {
        out += endtag;
      }
    }
  }

  return out;
}

export function list<T>(iter: Iterable<T>): T[] {
  const ret: T[] = [];

  for (const item of iter) {
    ret.push(item);
  }

  return ret;
}
