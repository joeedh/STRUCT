let colormap = {
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
  "peach"   : 210
}

export function tab(n, chr = ' ') {
  let t = '';

  for (let i = 0; i < n; i++) {
    t += chr;
  }

  return t;
}

export let termColorMap = {};
for (let k in colormap) {
  termColorMap[k] = colormap[k];
  termColorMap[colormap[k]] = k;
}

export function termColor(s, c) {
  if (typeof s === "symbol") {
    s = s.toString();
  } else {
    s = "" + s;
  }

  if (c in colormap)
    c = colormap[c]

  if (c > 107) {
    let s2 = '\u001b[38;5;' + c + "m"
    return s2 + s + '\u001b[0m'
  }

  return '\u001b[' + c + 'm' + s + '\u001b[0m'
};

export function termPrint() {
  //let console = window.console;

  let s = '';
  for (let i = 0; i < arguments.length; i++) {
    if (i > 0) {
      s += ' ';
    }
    s += arguments[i];
  }

  let re1a = /\u001b\[[1-9][0-9]?m/;
  let re1b = /\u001b\[[1-9][0-9];[0-9][0-9]?;[0-9]+m/
  let re2 = /\u001b\[0m/;

  let endtag = '\u001b[0m';

  function tok(s, type) {
    return {
      type : type,
      value: s
    }
  }

  let tokdef = [
    [re1a, "start"],
    [re1b, "start"],
    [re2, "end"]
  ];

  let s2 = s;

  let i = 0;
  let tokens = [];

  while (s2.length > 0) {
    let ok = false;

    let mintk = undefined, mini = undefined;
    let minslice = undefined, mintype = undefined;

    for (let tk of tokdef) {
      let i = s2.search(tk[0]);

      if (i >= 0 && (mini === undefined || i < mini)) {
        minslice = s2.slice(i, s2.length).match(tk[0])[0];
        mini = i;
        mintype = tk[1];
        mintk = tk;
        ok = true;
      }
    }

    if (!ok) {
      break;
    }

    if (mini > 0) {
      let chunk = s2.slice(0, mini);
      tokens.push(tok(chunk, "chunk"));
    }

    s2 = s2.slice(mini+minslice.length, s2.length);
    let t = tok(minslice, mintype);

    tokens.push(t);
  }

  if (s2.length > 0) {
    tokens.push(tok(s2, "chunk"));
  }

  let stack = [];
  let cur;

  let out = '';

  for (let t of tokens) {
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

export function list(iter) {
  let ret = [];

  for (let item of iter) {
    ret.push(item);
  }

  return ret;
}