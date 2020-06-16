let nstructjs = require('../../src/structjs.js');
nstructjs.STRUCT_ENDIAN = false; //little endian
let binpack = nstructjs.binpack;

let extTypes = require("./mobiExtTypes.js");

let MobiTypeMap = extTypes.MobiTypeMap;
let MobiTypes = extTypes.MobiTypes;

class Section {
  constructor(type, record) {
    this.type = type;
    this.record = record;
  }
};

class PalmDBHeader {
  constructor() {
    this.records = [];
    this.sections = [];
  }
}
PalmDBHeader.STRUCT = `
PalmDBHeader {
  name               : static_string[32];
  attributes         : short; 
  version            : short;
  cdata              : int;
  mdate              : int;
  backupdate         : int;
  modificationNumber : int;
  appInfoID          : int;
  sortInfoID         : int;
  type               : static_string[4];
  creator            : static_string[4];
  uniqueIDseed       : int;
  nextRecordListID   : int;
  totrecords         : short;
}
`;

//make sure to skip two bytes *after* reading PalmRecordInfos
nstructjs.register(PalmDBHeader);

class PalmRecordInfo {
  constructor() {
  }
  
  loadSTRUCT(reader) {
    reader(this);
    
    this.uid = this.uid[0] | (this.uid[1] << 8) | (this.uid[2] << 16);
  }
}

PalmRecordInfo.STRUCT = `
PalmRecordInfo {
  offset         : int;
  attributes     : byte;
  uid            : static_string[3];
}
`;
nstructjs.register(PalmRecordInfo);

class PalmDoc {
}
PalmDoc.STRUCT = `
PalmDoc {
  compression : short;
  pad1        : short;
  finalSize   : int;
  recordCount : ushort;
  recordSize  : ushort;
  curPos      : int;
}
`
nstructjs.register(PalmDoc);

class MobiHeader {
  loadSTRUCT(reader) {
    reader(this);
    
    this.hasEXTH = !!(this.EXTHFlags & 0x04);
  }
}
MobiHeader.STRUCT = `
MobiHeader {
  magic           : static_string[4];
  headerLen       : int;
  mobiType        : int;
  textEncoding    : int;
  uuid            : int;
  version         : int;
  orthoIndex      : int;
  inflection      : int;
  indexNames      : int;
  indexKeys       : int;
  extraIndex0     : int;
  extraIndex1     : int;
  extraIndex2     : int;
  extraIndex3     : int;
  extraIndex4     : int;
  extraIndex5     : int;
  nonBookIndex    : int;
  FullNameOff     : int;
  FullNameLen     : int;
  Locale          : int;
  dictLanguageIn  : int;
  dictLanguageOut : int;
  minVersion      : int;
  firstImageIndex : int;
  HuffmanRecOff   : int;
  HuffmanRecCount : int;
  HuffmanTableOff : int;
  HuffmanTableLen : int;
  EXTHFlags       : uint;
}
`
nstructjs.register(MobiHeader);

class MobiHeader2 {
  loadSTRUCT(reader) {
    reader(this);
  }
}
MobiHeader2.STRUCT = `
MobiHeader2 {
  pad1              : static_array[byte, 32];
  pad2              : int;
  drmOffset         : int;
  drmCount          : int;
  drmSize           : int;
  drmFlags          : uint;
  pad3              : int;
  pad4              : int;
}
`
nstructjs.register(MobiHeader2);

class MobiHeader3 {
  loadSTRUCT(reader) {
    reader(this);
  }
}
MobiHeader3.STRUCT = `
MobiHeader3 {
  firstContentRec      : int;
  lastContentRec       : int;
  pad1                 : int;
  FCIS                 : int;
  pad2                 : int;
  flisRecNumber        : int;
  pad3                 : int;
  pad4                 : static_string[12];
  firstCompileDataSect : int;
  numCompileDataSect   : int;
  pad5                 : int;
  extraRecordFlags     : int;
  recordOffsetINDX     : int;
  pad6                 : static_string[20];
  extTag               : int;
}
`
nstructjs.register(MobiHeader3);

class ExtHeader {
  constructor() {
    this.records = [];
    this.recmap = {};
  }
  
  loadSTRUCT(reader) {
    reader(this);
  }
}
ExtHeader.STRUCT = `
ExtHeader {
  magic           : static_string[4];
  headerLen       : int;
  recCount        : int;
}
`
nstructjs.register(ExtHeader);

class ExtRecord {
  loadSTRUCT(reader) {
    reader(this);
  }
}
ExtRecord.STRUCT = `
ExtRecord {
  type            : int;
  recordLen       : int;
}
`
nstructjs.register(ExtRecord);


exports.readPalmDB = function(data) {
  if (data instanceof Uint8Array) {
    data = new DataView(data.buffer);
  } else if (Array.isArray(data)) {
    data = new DataView(new Uint8Array(data).buffer);
  } else if (typeof data === "string") {
    console.warn("loading binary string");
    let buf = [];
    
    for (let i=0; i<data.length; i++) {
      buf.push(data.charCodeAt(i));
    }
    
    data = new DataView(new Uint8Array(buf).buffer);
  }
  
  let uctx = new nstructjs.unpack_context();
  
  let header = nstructjs.readObject(data, PalmDBHeader, uctx);

  //skip two bytes
  //nstructjs.binpack.unpack_short(data, uctx);
  
  for (let i=0; i<header.totrecords; i++) {
    header.records.push(nstructjs.readObject(data, PalmRecordInfo, uctx));
  }
  
  let u8 = new Uint8Array(data.buffer);
  
  let off = uctx.i;
  
  for (let rec of header.records) {
  }
  
  for (let i=0; i<header.records.length-1; i++) {
    let rec = header.records[i];
    let start = rec.offset;
    let end = header.records[i+1].offset;
    
    if (i === 0) {
      uctx.i = start;
      header.palmDocHeader = nstructjs.readObject(data, PalmDoc, uctx);
      let mobi = header.mobiHeader = nstructjs.readObject(data, MobiHeader, uctx);
      
      if (mobi.headerLen >= 132) {
        header.mobiHeader2 = nstructjs.readObject(data, MobiHeader2, uctx);
      }
      if (mobi.headerLen >= 184) {
        header.mobiHeader3 = nstructjs.readObject(data, MobiHeader3, uctx);
      }
      
      uctx.i = start + mobi.headerLen + 16;
      
      let exth =  binpack.unpack_static_string(data, uctx, 4);
      if (exth === "EXTH") {
        mobi.hasEXTH = true;
      }
      
      
      if (!mobi.hasEXTH) {
        continue;
      }
      
      uctx.i = start + mobi.headerLen + 16;
      exth = header.extHeader = nstructjs.readObject(data, ExtHeader, uctx);
      
      for (let i=0; i<exth.recCount; i++) {
        let start2 = uctx.i;
        let rec = nstructjs.readObject(data, ExtRecord, uctx);
        
        if (!MobiTypeMap[rec.type]) {
          console.log("invalid type!", rec.type, i);
          break;
        }
        let data2 = binpack.unpack_bytes(data, uctx, rec.recordLen-8);
        data2 = new Uint8Array(data2.buffer);
        
        let s = "";
        for (let i=0; i<data2.length; i++) {
          let c = data2[i];
          
          if (c > 31 && c < 220) {
            s += String.fromCharCode(c);
          } else {
            s += "?";
          }
          
          if (i > 533) {
            break;
          }
        }
        
        uctx.i = start2 + rec.recordLen;
        console.log(MobiTypeMap[rec.type], "-", "'"+s+"'", rec.recordLen, rec.type);
      }
      if (uctx.i % 8 > 0) {
        uctx.i += 7 - (uctx.i % 8);
      }
      
      console.log("end ext headers\n");
      continue;
    }
    //start = off;
    //end += start;
    
    //off = end;
    
   // console.log(rec.offset);
    //console.log(rec.offset, u8.length)
    let d = new Uint8Array(u8.buffer, start, end-start);
    //d = u8.slice(start, end);
    
    let s = "";
    for (let i=0; i<d.length; i++) {
      if (d[i] > 16 && d[i] < 275) {
        s += String.fromCharCode(d[i]);
      } else {
        if (d[i] === 0)
          s += "\\0"
        else 
          s += "?"
      }
      
    }
    
    let magic = s.slice(0, 4);
    let ucase;
    
    try {
      ucase = magic.toUpperCase();
    } catch (error) {
      continue;
    }
    
    if (magic === ucase && magic.match(/[A-Z]+[A-Z0-9]*$/)) {
      console.log("found special section", magic);
      header.sections.push(new Section(magic, rec));
    }
    
    
    rec.data = d;
    rec.sdata = s;
  }
  
  //console.log(header.sections);
  //skip two bytes
  binpack.unpack_short(data, uctx);
  let rest = header.rest = new Uint8Array(data.buffer, uctx.i, data.buffer.byteLength-uctx.i);
  
  return header;
}

function test() {
  let fs = require('fs');
  
  let data = fs.readFileSync("./test.mobi");
  let ret = exports.readPalmDB(data);
  
  //console.log(ret);
}

test();