
//Warning: Calibre creates fake creator entries, pretending to be a Linux kindlegen 1.2 (201, 1, 2, 33307) for normal ebooks and a non-public Linux kindlegen 2.0 (201, 2, 0, 101) for periodicals.	
let mobiTypeMap = {
1: 'drm_server_id		' ,
2: 'drm_commerce_id		' ,
3: 'drm_ebookbase_book_id		' ,
100: 'author		<dc:Creator>' ,
101: 'publisher		<dc:Publisher>' ,
102: 'imprint		<Imprint>' ,
103: 'description		<dc:Description>' ,
104: 'isbn		<dc:Identifier scheme="ISBN">' ,
105: 'subject	Could appear multiple times	<dc:Subject>' ,
106: 'publishingDate		<dc:Date>' ,
107: 'review		<Review>' ,
108: 'contributor		<dc:Contributor>' ,
109: 'rights		<dc:Rights>' ,
110: 'subjectCode		<dc:Subject BASICCode="subjectcode">' ,
111: 'type		<dc:Type>' ,
112: 'source		<dc:Source>' ,
113: 'asin	Kindle Paperwhite labels books with "Personal" if they don\'t have this record.	' ,
114: 'versionNumber		' ,
115: 'isSample	0x0001: "if the book content is only a sample of the full book	' ,
116: 'startReading	Position (4-byte offset) in file at which to open when first opened	' ,
117: 'adultContent	Mobipocket Creator adds this if Adult only is checked on its GUI; contents: "yes"	<Adult>' ,
118: 'retailPriceText	As text, e.g. "4.99"	<SRP>' ,
119: 'retailPriceCurrency currency	As text, e.g. "USD"	<SRP Currency="currency">' ,
121: 'KF8: "BOUNDARY Offset		' ,
125: 'countOfResources		' ,
129: 'KF8: "cover URI		' ,
131: 'Unknown		' ,
200: 'Dictionary short name	As text	<DictionaryVeryShortName>' ,
201: 'coverOffset	Add to first image field in Mobi Header to find PDB record containing the cover image	<EmbeddedCover>' ,
202: 'thumbOffset	Add to first image field in Mobi Header to find PDB record containing the thumbnail cover image	' ,
203: 'hasFakeCover		' ,
204: 'Creator Software	Known Values: 1=mobigen, 2=Mobipocket Creator, 200=kindlegen (Windows), 201=kindlegen (Linux), 202=kindlegen (Mac).' ,
205: 'Creator Major Version		' ,
206: 'Creator Minor Version		' ,
207: 'Creator Build Number		' ,
208: 'watermark		' ,
209: 'tamper proof keys	Used by the Kindle (and Android app) for generating book-specific PIDs.	' ,
300: 'fontsignature		' ,
401: 'clippinglimit	Integer percentage of the text allowed to be clipped. Usually 10.	' ,
402: 'publisherlimit		' ,
403: 'Unknown		' ,
404: 'ttsflag	1: - Text to Speech disabled; 0: - Text to Speech enabled	' ,
405: 'Unknown (Rent/Borrow flag?)	1: "in this field seems to indicate a rental book	' ,
406: 'Rent/Borrow Expiration Date	If this field is removed from a rental, the book says it expired in 1969: ' ,
407: 'Unknown		' ,
450: 'Unknown		' ,
451: 'Unknown		' ,
452: 'Unknown		' ,
453: 'Unknown		' ,
501: 'cde_type	PDOC - Personal Doc; EBOK - ebook; EBSP - ebook sample;	' ,
502: 'lastUpdateTime		' ,
503: 'updatedTitle		' ,
504: 'asin	I found a copy of ASIN in this record.	' ,
524: 'language		<dc:language>' ,
525: 'writingMode	I found horizontal-lr in this record.	' ,
535: 'Creator Build Number	I found 1019-d6e4792: "in this record, which is a build number of Kindlegen 2.7: ' ,
536: 'Unknown		' ,
542: 'Unknown	Some Unix timestamp.	' ,
547: 'InMemory	String \'I\\x00n\\x00M\\x00e\\x00m\\x00o\\x00r\\x00y\\x00\' found in this record, for KindleGen V2.9: \'build 1029-0897292: ' ,
}

let m = `//auto-generated from data copy and pasted from: https://wiki.mobileread.com/wiki/MOBI#Format
exports.MobiTypeMap = {
`;

let map = {};
for (let k in mobiTypeMap) {
  let v = mobiTypeMap[k].trim()
  k = k.trim();
  
  let type = v;
  let bad = v.search(/([\-\+"'`\n\\\<\>\(\)]+)/);
  bad = bad < 0 ? v.length : bad;
  
  let bad2 = v.search(/[\t]|   /);
  
  if (bad2 >= 0) {
    bad = Math.min(bad, bad2);
  }
  
  if (bad >= 0) {
    type = v.slice(0, bad).trim();
  }
  
  type = type.replace(/[ \t\-\+_\\\/]+/g, " ");
  type = type.replace(/([a-z])([A-Z])/g, "$1 $2");
  type = type.replace(/:/g, "");
  
  let words = type.split(" ");
  type = "";
  let i = 0;
  for (let w of words) {
    //type += w[0].toUpperCase() + w.slice(1, w.length).toLowerCase();
    if (i > 0) {
      type += "_";
    }
    type += w.toUpperCase();
    i++;
  }
  
  
  m += `  ${k}: '${type}',\n`;
  map[k] = {
    type        : type,
    description : mobiTypeMap[k]
  }
}
m += "}\n";
m += "\nexports.MobiTypes = {\n";

for (let k in mobiTypeMap) {
  let v = map[k];
  if (v.type !== "UNKNOWN") {
    m += `  ${v.type}: ${k},\n`;
  }
}
m += "}\n";

m += "\nexports.MobiTypeDescriptions = {\n";

for (let k in mobiTypeMap) {
  let v = mobiTypeMap[k].trim();
  
  let v2 = map[k];
  if (v2.type !== "UNKNOWN") {
    m += `  ${v2.type}: \`${v}\`,\n`;
  }
}
m += "}\n";

console.log(m);
require('fs').writeFileSync("mobiExtTypes.js", m);

