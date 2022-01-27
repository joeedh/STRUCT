import * as struct_parser from './struct_parser.js';
import * as struct_typesystem from './struct_typesystem.js';
import * as struct_parseutil from './struct_parseutil.js';
import * as struct_binpack from './struct_binpack.js';
import * as struct_filehelper from './struct_filehelper.js';
import * as struct_intern from './struct_intern.js';
import * as struct_eval from './struct_eval.js';

export {unpack_context} from './struct_binpack.js';
import {manager} from './struct_intern.js';

export * from './struct_intern.js';

/** truncate webpack mangled names. defaults to true
 *  so Mesh$1 turns into Mesh */
export function truncateDollarSign(value = true) {
  struct_intern.truncateDollarSign = !!value;
}

export function validateStructs(onerror) {
  return manager.validateStructs(onerror);
}

/**
 true means little endian, false means big endian
 */
export function setEndian(mode) {
  let ret = struct_binpack.STRUCT_ENDIAN;

  struct_binpack.STRUCT_ENDIAN = mode;

  return ret;
}

export function getEndian() {
  return struct_binpack.STRUCT_ENDIAN;
}

export function setAllowOverriding(t) {
  return manager.allowOverriding = !!t;
}

export function isRegistered(cls) {
  return manager.isRegistered(cls);
}

/** Register a class with nstructjs **/
export function register(cls, structName) {
  return manager.register(cls, structName);
}

export function unregister(cls) {
  manager.unregister(cls);
}

export function inherit(child, parent, structName = child.name) {
  return STRUCT.inherit(...arguments);
}

/**
 @param data : DataView
 */
export function readObject(data, cls, __uctx = undefined) {
  return manager.readObject(data, cls, __uctx);
}

/**
 @param data : Array instance to write bytes to
 */
export function writeObject(data, obj) {
  return manager.writeObject(data, obj);
}

export function writeJSON(obj) {
  return manager.writeJSON(obj);
}

export function readJSON(json, class_or_struct_id) {
  return manager.readJSON(json, class_or_struct_id);
}

export {setDebugMode} from './struct_intern.js';
export {setWarningMode} from './struct_intern.js';

//$BUILD_TINYEVAL_START
import tinyeval1 from "../tinyeval/tinyeval.js";
export const tinyeval = tinyeval1;
import {nGlobal} from './struct_global.js';

export function useTinyEval() {
  struct_eval.setStructEval((buf) => {
    return tinyeval.eval(buf, nGlobal);
  });
};
//$BUILD_TINYEVAL_END


//export other modules

export {struct_binpack as binpack}
export {struct_typesystem as typesystem}
export {struct_parseutil as parseutil}
export {struct_parser as parser}
export {struct_filehelper as filehelper}
