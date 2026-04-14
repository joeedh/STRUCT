"use strict";

import * as struct_binpack from "./struct_binpack.js";
import * as struct_parser from "./struct_parser.js";
import * as _sintern2 from "./struct_intern2.js";
import * as _struct_eval from "./struct_eval.js";
import jsonParser, { printContext, TokSymbol } from "./struct_json.js";
import * as util from "./struct_util.js";

import {
  TypeDescriptor,
  StructField,
  StructKeywords,
  StructableClass,
  StructableInstance,
  StructManager,
  NStructInterface,
  UnpackContext,
  FormatCtx,
  StructFieldTypeClass,
  StructEnumValue,
  Version,
  StructEnum,
} from "./types.js";

// needed to avoid a rollup bug in configurable mode
const sintern2 = _sintern2;
const struct_eval = _struct_eval;

import { DEBUG } from "./struct_global.js";

import { _get_pack_debug, StructFieldTypeMap } from "./struct_intern2.js";

let warninglvl = 2;

export let truncateDollarSign = true;
export let manager: STRUCT;

export class JSONError extends Error {}

function printCodeLines(code: string): string {
  const lines = code.split(String.fromCharCode(10));
  let buf = "";

  for (let i = 0; i < lines.length; i++) {
    let line = "" + (i + 1) + ":";

    while (line.length < 3) {
      line += " ";
    }

    line += " " + lines[i];
    buf += line + String.fromCharCode(10);
  }

  return buf;
}

function printEvalError(code: string): void {
  console.log("== CODE ==");
  console.log(printCodeLines(code));

  /* Node suppresses the real error line number in error.stack for some reason.
   * Get it by retriggering the error for real.
   */
  eval(code);
}

export function setTruncateDollarSign(v: unknown): void {
  truncateDollarSign = !!v;
}

export function _truncateDollarSign(s: string): string {
  const i = s.search("$");

  if (i > 0) {
    return s.slice(0, i).trim();
  }

  return s;
}

function unmangle(name: string): string {
  if (truncateDollarSign) {
    return _truncateDollarSign(name);
  } else {
    return name;
  }
}

import {
  StructTypes,
  StructTypeMap,
  StructEnum as StructEnumParser,
  NStruct,
  struct_parse,
  ValueTypes,
  ArrayTypes,
} from "./struct_parser.js";

let _static_envcode_null = "";

function gen_tabstr(tot: number): string {
  let ret = "";

  for (let i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

let packer_debug: (...args: unknown[]) => void;
let packer_debug_start: (...args: unknown[]) => void;
let packer_debug_end: (...args: unknown[]) => void;

function update_debug_data(): void {
  const ret = _get_pack_debug();

  packer_debug = ret.packer_debug;
  packer_debug_start = ret.packer_debug_start;
  packer_debug_end = ret.packer_debug_end;
  warninglvl = ret.warninglvl;
}

update_debug_data();

export function setWarningMode(t: unknown): void {
  sintern2.setWarningMode2(t as number);

  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl = t;
}

export function setDebugMode(t: unknown): void {
  sintern2.setDebugMode2(t as number);
  update_debug_data();
}

let _ws_env: [unknown, unknown][] = [[undefined, undefined]];

function define_empty_class(scls: { keywords: StructKeywords }, name: string): StructableClass {
  const cls = function (this: StructableInstance) {} as unknown as StructableClass;

  cls.prototype = Object.create(Object.prototype);
  (cls as any).constructor = cls.prototype.constructor = cls;

  const keywords = scls.keywords;

  (cls as any)[keywords.script] = name + " {\n  }\n";
  (cls as any)[keywords.name] = name;

  cls.prototype[keywords.load] = function (this: StructableInstance, reader: (obj: StructableInstance) => void) {
    reader(this);
  };

  (cls as any)[keywords.new] = function (this: StructableClass) {
    return new this();
  };

  return cls;
}

//$KEYWORD_CONFIG_START

export class STRUCT {
  idgen: number;
  allowOverriding: boolean;
  structs: Record<string, NStructInterface>;
  struct_cls: Record<string, StructableClass>;
  struct_ids: Record<number, NStructInterface>;
  compiled_code: Record<string, (this: unknown, obj: unknown, env: unknown) => unknown>;
  null_natives: Record<string, number>;
  jsonUseColors: boolean;
  jsonBuf: string;
  jsonLogger!: (...args: unknown[]) => void;
  formatCtx: FormatCtx;

  static keywords: StructKeywords;

  constructor() {
    this.idgen = 0;
    this.allowOverriding = true;

    this.structs = {};
    this.struct_cls = {};
    this.struct_ids = {};

    this.compiled_code = {};
    this.null_natives = {};

    this.define_null_native("Object", Object as unknown as StructableClass);

    this.jsonUseColors = true;
    this.jsonBuf = "";
    this.formatCtx = {};
  }

  static inherit(child: StructableClass, parent: StructableClass, structName: string = child.name!): string {
    const keywords = this.keywords;

    if (!(parent as any)[keywords.script]) {
      return structName + "{\n";
    }

    const stt = struct_parse.parse((parent as any)[keywords.script] as string) as NStruct;
    let code = structName + "{\n";
    code += STRUCT.fmt_struct(stt, true, false, true);
    return code;
  }

  /** invoke loadSTRUCT methods on parent objects.  note that
   reader() is only called once.  it is called however.*/
  static Super(obj: StructableInstance, reader: (obj: StructableInstance) => void): void {
    if (warninglvl > 0) {
      console.warn("deprecated");
    }

    reader(obj);

    function reader2(_obj: StructableInstance): void {}

    const cls = obj.constructor;
    const keywords = this.keywords;
    let bad = cls === undefined || cls.prototype === undefined || Object.getPrototypeOf(cls.prototype) === undefined;

    if (bad) {
      return;
    }

    const parentProto = Object.getPrototypeOf(cls.prototype);
    const parent = parentProto.constructor as StructableClass;
    bad = bad || parent === undefined;

    if (!bad && parent.prototype[keywords.load] && parent.prototype[keywords.load] !== (obj as any)[keywords.load]) {
      (
        parent.prototype[keywords.load] as (this: StructableInstance, reader: (obj: StructableInstance) => void) => void
      ).call(obj, reader2);
    }
  }

  /** deprecated.  used with old fromSTRUCT interface. */
  static chain_fromSTRUCT(cls: StructableClass, reader: (obj: StructableInstance) => void): StructableInstance {
    const keywords = this.keywords;

    if (warninglvl > 0) {
      console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");
    }

    const proto = cls.prototype;
    const parent = (proto as any).prototype as { constructor: StructableClass };

    const obj = (parent.constructor as any)[keywords.from] as (
      reader: (obj: StructableInstance) => void
    ) => StructableInstance;
    const result = obj(reader);
    const obj2 = new cls() as StructableInstance;

    const keys: (string | symbol)[] = (Object.keys(result) as (string | symbol)[]).concat(
      Object.getOwnPropertySymbols(result)
    );

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];

      try {
        (obj2 as unknown as Record<string | symbol, unknown>)[k] = (
          result as unknown as Record<string | symbol, unknown>
        )[k];
      } catch (error) {
        if (warninglvl > 0) {
          console.warn("  failed to set property", k);
        }
      }
    }

    return obj2;
  }

  // defined_classes is an array of class constructors
  // with STRUCT scripts, *OR* another STRUCT instance

  static formatStruct(stt: NStructInterface, internal_only?: boolean, no_helper_js?: boolean): string {
    return this.fmt_struct(stt, internal_only, no_helper_js);
  }

  static fmt_struct(
    stt: NStructInterface,
    internal_only?: boolean,
    no_helper_js?: boolean,
    addComments?: boolean,
    excludeId?: boolean
  ): string {
    if (internal_only === undefined) internal_only = false;
    if (no_helper_js === undefined) no_helper_js = false;

    let s = "";
    if (!internal_only) {
      s += stt.name;
      if (!excludeId && stt.id !== -1) s += " id=" + stt.id;
      s += " {\n";
    }
    const tab = "  ";

    function fmt_type(type: TypeDescriptor): string {
      return (StructFieldTypeMap as Record<number, StructFieldTypeClass>)[type.type].format(type);

      // Dead code below kept as comment for reference
      // if (type.type === StructEnum.ARRAY || ...) { ... }
    }

    const fields = stt.fields;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      s += tab + f.name + " : " + fmt_type(f.type);
      if (!no_helper_js && f.get !== undefined) {
        s += " | " + f.get.trim();
      }
      s += ";";

      if (addComments && f.comment.trim()) {
        s += f.comment.trim();
      }

      s += "\n";
    }
    if (!internal_only) s += "}";
    return s;
  }

  static setClassKeyword(keyword: string, nameKeyword?: string): void {
    if (!nameKeyword) {
      nameKeyword = keyword.toLowerCase() + "Name";
    }

    this.keywords = {
      script: keyword,
      name  : nameKeyword,
      load  : "load" + keyword,
      new   : "new" + keyword,
      after : "after" + keyword,
      from  : "from" + keyword,
    };
  }

  define_null_native(name: string, cls: StructableClass): void {
    const keywords = (this.constructor as typeof STRUCT).keywords;
    const obj = define_empty_class(this.constructor as typeof STRUCT, name);

    const stt = struct_parse.parse((obj as any)[keywords.script] as string) as NStruct;

    stt.id = this.idgen++;

    this.structs[name] = stt;
    this.struct_cls[name] = cls;
    this.struct_ids[stt.id] = stt;

    this.null_natives[name] = 1;
  }

  validateStructs(onerror?: (msg: string, stt: NStructInterface, field: StructField) => void): void {
    function getType(type: TypeDescriptor): TypeDescriptor {
      switch (type.type) {
        case StructEnum.ITERKEYS:
        case StructEnum.ITER:
        case StructEnum.STATIC_ARRAY:
        case StructEnum.ARRAY:
          return getType((type.data as { type: TypeDescriptor }).type);
        case StructEnum.TSTRUCT:
          return type;
        case StructEnum.STRUCT:
        default:
          return type;
      }
    }

    function formatType(type: TypeDescriptor): Record<string, unknown> {
      const ret: Record<string, unknown> = {};

      ret.type = type.type;

      if (typeof ret.type === "number") {
        for (const k in StructEnum) {
          if ((StructEnum as any)[k] === ret.type) {
            ret.type = k;
            break;
          }
        }
      } else if (typeof ret.type === "object") {
        ret.type = formatType(ret.type as TypeDescriptor);
      }

      if (typeof type.data === "object") {
        ret.data = formatType(type.data as TypeDescriptor);
      } else {
        ret.data = type.data;
      }

      return ret;
    }

    function throwError(stt: NStructInterface, field: StructField, msg: string): void {
      const buf = STRUCT.formatStruct(stt);

      console.error(buf + "\n\n" + msg);

      if (onerror) {
        onerror(msg, stt, field);
      } else {
        throw new Error(msg);
      }
    }

    for (const k in this.structs) {
      const stt = this.structs[k];

      for (const field of stt.fields) {
        if (field.name === "this") {
          const type = field.type.type;

          if (struct_parser.ValueTypes.has(type)) {
            throwError(stt, field, "'this' cannot be used with value types");
          }
        }

        const type = getType(field.type);

        if (type.type !== StructEnum.STRUCT && type.type !== StructEnum.TSTRUCT) {
          continue;
        }

        if (!((type.data as string) in this.structs)) {
          const msg = stt.name + ":" + field.name + ": Unknown struct " + (type.data as string) + ".";
          throwError(stt, field, msg);
        }
      }
    }
  }

  forEach(func: (stt: NStructInterface) => void, thisvar?: unknown): void {
    for (const k in this.structs) {
      const stt = this.structs[k];

      if (thisvar !== undefined) func.call(thisvar, stt);
      else func(stt);
    }
  }

  // defaults to structjs.manager
  parse_structs(buf: string, defined_classes?: StructableClass[] | STRUCT): void {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    if (defined_classes === undefined) {
      defined_classes = manager;
    }

    if (defined_classes instanceof STRUCT) {
      const struct2 = defined_classes;
      const arr: StructableClass[] = [];

      for (const k in struct2.struct_cls) {
        arr.push(struct2.struct_cls[k]);
      }

      defined_classes = arr;
    }

    if (defined_classes === undefined) {
      const arr: StructableClass[] = [];

      for (const k in manager.struct_cls) {
        arr.push(manager.struct_cls[k]);
      }

      defined_classes = arr;
    }

    const clsmap: Record<string, StructableClass> = {};

    for (let i = 0; i < defined_classes.length; i++) {
      const cls = defined_classes[i];

      if (!(cls as any)[keywords.name] && (cls as any)[keywords.script]) {
        const stt = struct_parse.parse(((cls as any)[keywords.script] as string).trim()) as NStruct;
        (cls as any)[keywords.name] = stt.name;
      } else if (!(cls as any)[keywords.name] && cls.name !== "Object") {
        if (warninglvl > 0) console.log("Warning, bad class in registered class list", unmangle(cls.name!), cls);
        continue;
      }

      clsmap[(cls as any)[keywords.name] as string] = defined_classes[i];
    }

    struct_parse.input(buf);

    while (!struct_parse.at_end()) {
      const stt = struct_parse.parse(undefined, false) as NStruct;

      if (!(stt.name in clsmap)) {
        if (!(stt.name in this.null_natives))
          if (warninglvl > 0) console.log("WARNING: struct " + stt.name + " is missing from class list.");

        const dummy = define_empty_class(this.constructor as typeof STRUCT, stt.name);

        (dummy as any)[keywords.script] = STRUCT.fmt_struct(stt, undefined, undefined, undefined, true);
        (dummy as any)[keywords.name] = stt.name;

        dummy.prototype[keywords.name] = dummy.name;

        this.struct_cls[(dummy as any)[keywords.name] as string] = dummy;
        this.structs[(dummy as any)[keywords.name] as string] = stt;

        if (stt.id !== -1) this.struct_ids[stt.id] = stt;
      } else {
        this.struct_cls[stt.name] = clsmap[stt.name];
        this.structs[stt.name] = stt;

        if (stt.id !== -1) this.struct_ids[stt.id] = stt;
      }

      let tok = struct_parse.peek();
      while (tok && (tok.value === "\n" || tok.value === "\r" || tok.value === "\t" || tok.value === " ")) {
        tok = struct_parse.peek();
      }
    }
  }

  /** adds all structs referenced by cls inside of srcSTRUCT
   *  to this */
  registerGraph(srcSTRUCT: STRUCT, cls: StructableClass): void {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    if (!(cls as any)[keywords.name]) {
      console.warn("class was not in srcSTRUCT");
      this.register(cls);
      return;
    }

    let recStruct: (st: NStructInterface, cls: StructableClass) => void;

    const recArray = (t: TypeDescriptor): void => {
      switch (t.type) {
        case StructEnum.ARRAY:
          return recArray((t.data as { type: TypeDescriptor }).type);
        case StructEnum.ITERKEYS:
          return recArray((t.data as { type: TypeDescriptor }).type);
        case StructEnum.STATIC_ARRAY:
          return recArray((t.data as { type: TypeDescriptor }).type);
        case StructEnum.ITER:
          return recArray((t.data as { type: TypeDescriptor }).type);
        case StructEnum.STRUCT:
        case StructEnum.TSTRUCT: {
          const st = srcSTRUCT.structs[t.data as string];
          const cls2 = srcSTRUCT.struct_cls[st.name];

          return recStruct(st, cls2);
        }
      }
    };

    recStruct = (st: NStructInterface, cls: StructableClass): void => {
      if (!(((cls as any)[keywords.name] as string) in this.structs)) {
        this.add_class(cls, (cls as any)[keywords.name] as string);
      }

      for (const f of st.fields) {
        if (f.type.type === StructEnum.STRUCT || f.type.type === StructEnum.TSTRUCT) {
          const st2 = srcSTRUCT.structs[f.type.data as string];
          const cls2 = srcSTRUCT.struct_cls[st2.name];

          recStruct(st2, cls2);
        } else if (f.type.type === StructEnum.ARRAY) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.ITER) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.ITERKEYS) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.STATIC_ARRAY) {
          recArray(f.type);
        }
      }
    };

    const st = srcSTRUCT.structs[(cls as any)[keywords.name] as string];
    recStruct(st, cls);
  }

  mergeScripts(child: string, parent: string): string {
    const stc = struct_parse.parse(child.trim()) as NStruct;
    const stp = struct_parse.parse(parent.trim()) as NStruct;

    const fieldset = new Set<string>();

    for (const f of stc.fields) {
      fieldset.add(f.name);
    }

    const fields: StructField[] = [];
    for (const f of stp.fields) {
      if (!fieldset.has(f.name)) {
        fields.push(f);
      }
    }

    stc.fields = fields.concat(stc.fields);
    return STRUCT.fmt_struct(stc, false, false);
  }

  inlineRegister(cls: StructableClass, structScript: string): string {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    let p: unknown = Object.getPrototypeOf(cls);
    while (p && p !== Object) {
      if ((p as any).hasOwnProperty(keywords.script)) {
        structScript = this.mergeScripts(structScript, (p as any)[keywords.script] as string);
        break;
      }
      p = Object.getPrototypeOf(p as object);
    }

    (cls as any)[keywords.script] = structScript;
    this.register(cls);
    return structScript;
  }

  register(cls: StructableClass, structName?: string): void {
    this.add_class(cls, structName);
  }

  unregister(cls: StructableClass): void {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    if (!cls || !(cls as any)[keywords.name] || !(((cls as any)[keywords.name] as string) in this.struct_cls)) {
      console.warn("Class not registered with nstructjs", cls);
      return;
    }

    const st = this.structs[(cls as any)[keywords.name] as string];

    delete this.structs[(cls as any)[keywords.name] as string];
    delete this.struct_cls[(cls as any)[keywords.name] as string];
    delete this.struct_ids[st.id];
  }

  add_class(cls: StructableClass, structName?: string): void {
    // do not register Object
    if (cls === (Object as unknown)) {
      return;
    }

    const keywords = (this.constructor as typeof STRUCT).keywords;
    if ((cls as any)[keywords.script]) {
      let bad = false;

      let p: unknown = cls;
      while (p) {
        p = Object.getPrototypeOf(p as object);

        if (p && (p as any)[keywords.script] && (p as any)[keywords.script] === (cls as any)[keywords.script]) {
          bad = true;
          break;
        }
      }

      if (bad) {
        if (warninglvl > 0) {
          console.warn("Generating " + keywords.script + " script for derived class " + unmangle(cls.name!));
        }

        if (!structName) {
          structName = unmangle(cls.name!);
        }

        (cls as any)[keywords.script] = STRUCT.inherit(cls, p as StructableClass) + "\n}";
      }
    }

    if (!(cls as any)[keywords.script]) {
      throw new Error("class " + unmangle(cls.name!) + " has no " + keywords.script + " script");
    }

    const stt = struct_parse.parse((cls as any)[keywords.script] as string) as NStruct;

    stt.name = unmangle(stt.name);

    (cls as any)[keywords.name] = stt.name;

    // create default newSTRUCT
    if ((cls as any)[keywords.new] === undefined) {
      (cls as any)[keywords.new] = function (this: StructableClass) {
        return new this();
      };
    }

    if (structName !== undefined) {
      stt.name = structName;
      (cls as any)[keywords.name] = structName;
    } else if ((cls as any)[keywords.name] === undefined) {
      (cls as any)[keywords.name] = stt.name;
    } else {
      stt.name = (cls as any)[keywords.name] as string;
    }

    if (((cls as any)[keywords.name] as string) in this.structs) {
      if (warninglvl > 0) {
        console.warn("Struct " + unmangle((cls as any)[keywords.name] as string) + " is already registered", cls);
      }

      if (!this.allowOverriding) {
        throw new Error("Struct " + unmangle((cls as any)[keywords.name] as string) + " is already registered");
      }

      return;
    }

    if (stt.id === -1) stt.id = this.idgen++;

    this.structs[(cls as any)[keywords.name] as string] = stt;
    this.struct_cls[(cls as any)[keywords.name] as string] = cls;
    this.struct_ids[stt.id] = stt;
  }

  isRegistered(cls: StructableClass): boolean {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    if (!cls.hasOwnProperty("structName")) {
      return false;
    }

    return cls === this.struct_cls[(cls as any)[keywords.name] as string];
  }

  get_struct_id(id: number): NStructInterface {
    return this.struct_ids[id];
  }

  get_struct(name: string): NStructInterface {
    if (!(name in this.structs)) {
      console.warn("Unknown struct", name);
      throw new Error("Unknown struct " + name);
    }
    return this.structs[name];
  }

  get_struct_cls(name: string): StructableClass {
    if (!(name in this.struct_cls)) {
      console.trace();
      throw new Error("Unknown struct " + name);
    }
    return this.struct_cls[name];
  }

  _env_call(code: string, obj: unknown, env?: [string, unknown][]): unknown {
    let envcode = _static_envcode_null;
    if (env !== undefined) {
      envcode = "";
      for (let i = 0; i < env.length; i++) {
        envcode = "let " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
      }
    }
    let fullcode = "";
    if (envcode !== _static_envcode_null) fullcode = envcode + code;
    else fullcode = code;
    let func: (this: unknown, obj: unknown, env: unknown) => unknown;

    if (!(fullcode in this.compiled_code)) {
      const code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      try {
        func = struct_eval.structEval(code2) as (this: unknown, obj: unknown, env: unknown) => unknown;
      } catch (err) {
        console.warn((err as Error).stack);

        console.warn(code2);
        console.warn(" ");
        throw err;
      }
      this.compiled_code[fullcode] = func;
    } else {
      func = this.compiled_code[fullcode];
    }
    try {
      return func.call(obj, obj, env);
    } catch (err) {
      console.warn((err as Error).stack);

      const code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      console.warn(code2);
      console.warn(" ");
      throw err;
    }
  }

  write_struct(data: number[], obj: unknown, stt: NStructInterface): void {
    function use_helper_js(field: StructField): boolean {
      const type = field.type.type;
      const cls = (StructFieldTypeMap as Record<number, StructFieldTypeClass>)[type];
      return cls.useHelperJS(field);
    }

    const fields = stt.fields;
    const thestruct = this;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const t1 = f.type;
      const t2 = t1.type;

      if (use_helper_js(f)) {
        let val: unknown;
        const type = t2;
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : (obj as any)[f.name];
        }

        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        sintern2.do_pack(this, data, val, obj, f, t1);
      } else {
        const val = f.name === "this" ? obj : (obj as any)[f.name];
        sintern2.do_pack(this, data, val, obj, f, t1);
      }
    }
  }

  /**
   @param data : array to write data into,
   @param obj  : structable object
   */
  write_object(data: number[] | undefined, obj: unknown): number[] {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    const cls = (obj as any).constructor[keywords.name] as string;
    const stt = this.get_struct(cls);

    if (data === undefined) {
      data = [];
    }

    this.write_struct(data, obj, stt);
    return data;
  }

  /**
   Read an object from binary data

   @param data : DataView or Uint8Array instance
   @param cls_or_struct_id : Structable class
   @param uctx : internal parameter
   @return Instance of cls_or_struct_id
   */
  readObject<T = unknown>(
    data: DataView | Uint8Array | Uint8ClampedArray | number[],
    cls_or_struct_id: StructableClass<T> | number,
    uctx?: UnpackContext
  ): T {
    if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      data = new DataView(data.buffer);
    } else if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }

    return this.read_object(data as DataView, cls_or_struct_id, uctx);
  }

  /**
   @param data array to write data into,
   @param obj structable object
   */
  writeObject(data: number[] | undefined, obj: unknown): number[] {
    return this.write_object(data, obj);
  }

  writeJSON(obj: unknown, stt?: NStructInterface): Record<string, unknown> {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    const cls = (obj as StructableInstance).constructor;
    stt = stt || this.get_struct((cls as any)[keywords.name] as string);

    function use_helper_js(field: StructField): boolean {
      const type = field.type.type;
      const fieldCls = (StructFieldTypeMap as Record<number, StructFieldTypeClass>)[type];
      return fieldCls.useHelperJS(field);
    }

    const toJSON = sintern2.toJSON;

    const fields = stt.fields;
    const thestruct = this;
    const json: Record<string | number, unknown> = {};

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      let val: unknown;
      const t1 = f.type;

      let json2: unknown;

      if (use_helper_js(f)) {
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : (obj as any)[f.name];
        }

        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        json2 = toJSON(this, val, obj, f, t1);
      } else {
        val = f.name === "this" ? obj : (obj as any)[f.name];
        json2 = toJSON(this, val, obj, f, t1);
      }

      if (f.name !== "this") {
        json[f.name] = json2;
      } else {
        // f.name was 'this'?
        const isArrayCheck = Array.isArray(json2);
        let isArray = isArrayCheck || f.type.type === StructTypes.ARRAY;
        isArray = isArray || f.type.type === StructTypes.STATIC_ARRAY;

        if (isArray) {
          const arr = json2 as unknown[];
          json.length = arr.length;

          for (let j = 0; j < arr.length; j++) {
            json[j] = arr[j];
          }
        } else {
          Object.assign(json, json2 as any);
        }
      }
    }

    return json as any;
  }

  /**
   @param data : DataView or Uint8Array instance
   @param cls_or_struct_id : Structable class
   @param uctx : internal parameter
   */
  read_object<T = unknown>(
    data: DataView,
    cls_or_struct_id: StructableClass<T> | number,
    uctx?: UnpackContext,
    objInstance?: unknown
  ): T {
    const keywords = (this.constructor as typeof STRUCT).keywords;
    let cls: StructableClass<T>;
    let stt: NStructInterface;

    if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name] as StructableClass<T>;
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[(cls as any)[keywords.name] as string];

    if (uctx === undefined) {
      uctx = new struct_binpack.unpack_context();

      packer_debug("\n\n=Begin reading " + (cls as any)[keywords.name] + "=");
    }
    const thestruct = this;

    const this2 = this;

    function unpack_field(type: TypeDescriptor): unknown {
      return (StructFieldTypeMap as Record<number, StructFieldTypeClass>)[type.type].unpack(this2, data, type, uctx!);
    }

    function unpack_into(type: TypeDescriptor, dest: unknown): unknown {
      return (StructFieldTypeMap as Record<number, StructFieldTypeClass>)[type.type].unpackInto!(
        this2,
        data,
        type,
        uctx!,
        dest
      );
    }

    let was_run = false;

    function makeLoader(stt: NStructInterface): (obj: StructableInstance) => void {
      return function load(obj: StructableInstance): void {
        if (was_run) {
          return;
        }

        was_run = true;

        const fields = stt.fields;
        const flen = fields.length;

        for (let i = 0; i < flen; i++) {
          const f = fields[i];

          if (f.name === "this") {
            // load data into obj directly
            unpack_into(f.type, obj);
          } else {
            (obj as any)[f.name] = unpack_field(f.type);
          }
        }
      };
    }

    const loader = makeLoader(stt);

    if (cls.prototype[keywords.load] !== undefined) {
      let obj = objInstance as StructableInstance | undefined;

      if (!obj && (cls as any)[keywords.new] !== undefined) {
        obj = ((cls as any)[keywords.new] as (load: (obj: StructableInstance) => void) => StructableInstance).call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls() as StructableInstance;
      }

      const objAny = obj as any;
      objAny[keywords.load](loader);

      if (!was_run) {
        console.warn(
          "" + (cls as any)[keywords.name] + ".prototype[keywords.load]() did not execute its loader callback!"
        );
        loader(obj!);
      }

      return obj as T;
    } else if ((cls as any)[keywords.from] !== undefined) {
      if (warninglvl > 1) {
        console.warn(
          "Warning: class " +
            unmangle(cls.name!) +
            " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead"
        );
      }

      const anyCls = cls as any;
      return anyCls[keywords.from](loader) as T;
    } else {
      // default case, make new instance and then call load() on it
      let obj = objInstance as StructableInstance | undefined;

      if (!obj && (cls as any)[keywords.new] !== undefined) {
        obj = ((cls as any)[keywords.new] as (load: (obj: StructableInstance) => void) => StructableInstance).call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls() as StructableInstance;
      }

      loader(obj!);

      return obj as T;
    }
  }

  validateJSON(
    json: unknown,
    cls_or_struct_id: StructableClass | NStructInterface | number,
    useInternalParser: boolean = true,
    useColors: boolean = true,
    consoleLogger: (...args: unknown[]) => void = function (...args: unknown[]) {
      console.log(...args);
    },
    _abstractKey: string = "_structName"
  ): boolean {
    if (cls_or_struct_id === undefined) {
      throw new Error(this.constructor.name + ".prototype.validateJSON: Expected at least two arguments");
    }

    try {
      let jsonStr = JSON.stringify(json, undefined, 2);

      this.jsonBuf = jsonStr;
      this.jsonUseColors = useColors;
      this.jsonLogger = consoleLogger;

      // add token annotations
      (jsonParser as unknown as any).logger = this.jsonLogger;

      let parsed: unknown;
      if (useInternalParser) {
        parsed = jsonParser.parse(jsonStr);
      } else {
        parsed = JSON.parse(jsonStr);
      }

      this.validateJSONIntern(parsed as any, cls_or_struct_id, _abstractKey);
    } catch (error) {
      if (!(error instanceof JSONError)) {
        console.error((error as Error).stack);
      }

      this.jsonLogger((error as Error).message);
      return false;
    }

    return true;
  }

  validateJSONIntern(
    json: Record<string, unknown>,
    cls_or_struct_id: StructableClass | NStructInterface | number,
    _abstractKey: string = "_structName"
  ): boolean {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    let cls: StructableClass;
    let stt: NStructInterface;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id as StructableClass;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[(cls as any)[keywords.name] as string];

    if (stt === undefined) {
      throw new Error("unknown class " + cls);
    }

    const fields = stt.fields;
    const flen = fields.length;

    const keys = new Set<string>();
    keys.add(_abstractKey);

    let keyTestJson: Record<string, unknown> = json;

    for (let i = 0; i < flen; i++) {
      const f = fields[i];

      let val: unknown;

      let tokinfo: unknown;

      if (f.name === "this") {
        val = json;
        keyTestJson = {
          "this": json,
        };

        keys.add("this");
        tokinfo = (json as Record<string | symbol, unknown>)[TokSymbol as unknown as string];
      } else {
        val = json[f.name];
        keys.add(f.name);

        const jsonTokInfo = (json as Record<string | symbol, unknown>)[TokSymbol as unknown as string] as
          | Record<string, unknown>
          | undefined;
        tokinfo = jsonTokInfo ? (jsonTokInfo.fields as any)[f.name] : undefined;
        if (!tokinfo) {
          const f2 = fields[Math.max(i - 1, 0)];
          const tokSymTokInfo = (TokSymbol as unknown as Record<string | symbol, unknown>)[
            TokSymbol as unknown as string
          ] as any | undefined;
          tokinfo = tokSymTokInfo ? (tokSymTokInfo.fields as any)[f2.name] : undefined;
        }

        if (!tokinfo) {
          tokinfo = (json as Record<string | symbol, unknown>)[TokSymbol as unknown as string];
        }
      }

      if (val === undefined) {
        // console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
        // continue;
      }

      const instance = f.name === "this" ? val : json;

      const ret = sintern2.validateJSON(this, val, json, f, f.type, instance, _abstractKey);

      if (!ret || typeof ret === "string") {
        const msg = typeof ret === "string" ? ": " + ret : "";

        if (tokinfo) {
          this.jsonLogger(
            printContext(this.jsonBuf, tokinfo as import("./struct_json.js").TokInfo | undefined, this.jsonUseColors)
          );
        }

        if (val === undefined) {
          throw new JSONError(stt.name + ": Missing json field " + f.name + msg);
        } else {
          throw new JSONError(stt.name + ": Invalid json field " + f.name + msg);
        }

        return false;
      }
    }

    for (const k in keyTestJson) {
      if (typeof (json as any)[k] === "symbol") {
        // ignore symbols
        continue;
      }

      if (!keys.has(k)) {
        this.jsonLogger((cls as any)[keywords.script] as string);
        throw new JSONError(stt.name + ": Unknown json field " + k);
        return false;
      }
    }

    return true;
  }

  readJSON<T = unknown>(
    json: unknown,
    cls_or_struct_id: StructableClass<T> | NStructInterface | number,
    objInstance?: unknown
  ): T {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    let cls: StructableClass;
    let stt: NStructInterface;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id as StructableClass;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[(cls as any)[keywords.name] as string];

    packer_debug("\n\n=Begin reading " + (cls as any)[keywords.name] + "=");
    const thestruct = this;
    const this2 = this;
    let was_run = false;
    const fromJSON = sintern2.fromJSON;

    function makeLoader(stt: NStructInterface): (obj: StructableInstance) => void {
      return function load(obj: StructableInstance): void {
        if (was_run) {
          return;
        }

        was_run = true;

        const fields = stt.fields;
        const flen = fields.length;

        for (let i = 0; i < flen; i++) {
          const f = fields[i];

          let val: unknown;

          if (f.name === "this") {
            val = json;
          } else {
            val = (json as any)[f.name];
          }

          if (val === undefined) {
            if (warninglvl > 1) {
              console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
            }
            continue;
          }

          const instance = f.name === "this" ? obj : objInstance;

          const ret = fromJSON(this2, val, obj, f, f.type, instance);

          if (f.name !== "this") {
            (obj as any)[f.name] = ret;
          }
        }
      };
    }

    const loader = makeLoader(stt);

    if (cls.prototype[keywords.load] !== undefined) {
      let obj = objInstance as StructableInstance | undefined;

      if (!obj && (cls as any)[keywords.new] !== undefined) {
        obj = ((cls as any)[keywords.new] as (load: (obj: StructableInstance) => void) => StructableInstance).call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls() as StructableInstance;
      }

      const anyObj = obj as any;
      anyObj[keywords.load](loader);
      return obj as T;
    } else if ((cls as any)[keywords.from] !== undefined) {
      if (warninglvl > 1) {
        console.warn(
          "Warning: class " +
            unmangle(cls.name!) +
            " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead"
        );
      }
      const anyCls = cls as any;
      return anyCls[keywords.from](loader);
    } else {
      // default case, make new instance and then call load() on it
      let obj = objInstance as StructableInstance | undefined;

      if (!obj && (cls as any)[keywords.new] !== undefined) {
        obj = ((cls as any)[keywords.new] as (load: (obj: StructableInstance) => void) => StructableInstance).call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls() as StructableInstance;
      }

      loader(obj!);
      return obj as T;
    }
  }

  formatJSON_intern(
    json: Record<string, unknown>,
    stt: NStructInterface,
    field?: StructField,
    tlvl: number = 0
  ): string {
    const keywords = (this.constructor as typeof STRUCT).keywords;
    const addComments = this.formatCtx.addComments;

    let s = "{";

    if (addComments && field && field.comment.trim()) {
      s += " " + field.comment.trim();
    }

    s += "\n";

    for (const f of stt.fields) {
      const value = json[f.name];

      s += util.tab(tlvl + 1) + f.name + ": ";

      s += sintern2.formatJSON(this, value, json, f, f.type, undefined, tlvl + 1);
      s += ",";

      const basetype = f.type.type;
      let resolvedType = basetype;

      if (ArrayTypes.has(basetype)) {
        resolvedType = (f.type.data as { type: TypeDescriptor }).type.type;
      }

      const addComment = ValueTypes.has(resolvedType) && addComments && f.comment.trim();

      if (addComment) {
        s += " " + f.comment.trim();
      }

      s += "\n";
    }

    s += util.tab(tlvl) + "}";
    return s;
  }

  formatJSON(json: unknown, cls: StructableClass, addComments: boolean = true, validate: boolean = true): string {
    const keywords = (this.constructor as typeof STRUCT).keywords;

    let s = "";

    if (validate) {
      this.validateJSON(json, cls);
    }

    const stt = this.structs[(cls as any)[keywords.name] as string];

    this.formatCtx = {
      addComments,
      validate,
    };

    return this.formatJSON_intern(json as any, stt);
  }
}
//$KEYWORD_CONFIG_END

STRUCT.setClassKeyword("STRUCT");

export function deriveStructManager(
  keywords: {
    script: string;
    name?: string;
    load?: string;
    new?: string;
    from?: string;
  } = {
    script: "STRUCT",
    name  : undefined,
    load  : undefined,
    new   : undefined,
    from  : undefined,
  }
): typeof STRUCT {
  if (!keywords.name) {
    keywords.name = keywords.script.toLowerCase() + "Name";
  }

  if (!keywords.load) {
    keywords.load = "load" + keywords.script;
  }

  if (!keywords.new) {
    keywords.new = "new" + keywords.script;
  }

  if (!keywords.from) {
    keywords.from = "from" + keywords.script;
  }

  class NewSTRUCT extends STRUCT {}

  (NewSTRUCT as unknown as { keywords: StructKeywords }).keywords = keywords as StructKeywords;
  return NewSTRUCT;
}

// main struct script manager
manager = new STRUCT();

/**
 * Write all defined structs out to a string.
 *
 * @param nManager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
export function write_scripts(nManager: STRUCT = manager, include_code: boolean = false): string {
  let buf = "";

  /* prevent code generation bugs in configurable mode */
  const nl = String.fromCharCode(10);
  const tab = String.fromCharCode(9);

  nManager.forEach(function (stt: NStructInterface) {
    buf += STRUCT.fmt_struct(stt, false, !include_code) + nl;
  });

  let buf2 = buf;
  buf = "";

  for (let i = 0; i < buf2.length; i++) {
    const c = buf2[i];
    if (c === nl) {
      buf += nl;
      const i2 = i;
      while (i < buf2.length && (buf2[i] === " " || buf2[i] === tab || buf2[i] === nl)) {
        i++;
      }
      if (i !== i2) i--;
    } else {
      buf += c;
    }
  }

  return buf;
}
