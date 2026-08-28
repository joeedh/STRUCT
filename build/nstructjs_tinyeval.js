let nexports = (function () {
  if (typeof window === "undefined" && typeof global != "undefined") {
    global._nGlobal = global;
  } else if (typeof self !== "undefined") {
    self._nGlobal = self;
  } else {
    window._nGlobal = window;
  }
  
  let exports;
  let module = {};

  //nodejs?
  if (typeof window === "undefined" && typeof global !== "undefined") {
    //console.log("Nodejs!");
  } else {
    exports = {};
    _nGlobal.module = {exports : exports};
  }
  

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/acorn@7.4.1/node_modules/acorn/dist/acorn.js
var require_acorn = __commonJS({
  "node_modules/.pnpm/acorn@7.4.1/node_modules/acorn/dist/acorn.js"(exports3, module2) {
    (function(global2, factory) {
      typeof exports3 === "object" && typeof module2 !== "undefined" ? factory(exports3) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = global2 || self, factory(global2.acorn = {}));
    })(exports3, (function(exports4) {
      "use strict";
      var reservedWords = {
        3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
        5: "class enum extends super const export import",
        6: "enum",
        strict: "implements interface let package private protected public static yield",
        strictBind: "eval arguments"
      };
      var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
      var keywords = {
        5: ecma5AndLessKeywords,
        "5module": ecma5AndLessKeywords + " export import",
        6: ecma5AndLessKeywords + " const class extends export import super"
      };
      var keywordRelationalOperator = /^in(stanceof)?$/;
      var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࢠ-ࢴࢶ-ࣇऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-鿼ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞿꟂ-ꟊꟵ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
      var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛࣓-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍୕-ୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ඁ-ඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᪿᫀᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷹᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧ꠬ꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿";
      var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
      var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
      nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
      var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 107, 20, 28, 22, 13, 52, 76, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 230, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 35, 56, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 190, 0, 80, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8952, 286, 50, 2, 18, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 2357, 44, 11, 6, 17, 0, 370, 43, 1301, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42717, 35, 4148, 12, 221, 3, 5761, 15, 7472, 3104, 541, 1507, 4938];
      var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 154, 10, 176, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 19306, 9, 135, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 262, 6, 10, 9, 419, 13, 1495, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
      function isInAstralSet(code2, set) {
        var pos = 65536;
        for (var i = 0; i < set.length; i += 2) {
          pos += set[i];
          if (pos > code2) {
            return false;
          }
          pos += set[i + 1];
          if (pos >= code2) {
            return true;
          }
        }
      }
      function isIdentifierStart(code2, astral) {
        if (code2 < 65) {
          return code2 === 36;
        }
        if (code2 < 91) {
          return true;
        }
        if (code2 < 97) {
          return code2 === 95;
        }
        if (code2 < 123) {
          return true;
        }
        if (code2 <= 65535) {
          return code2 >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code2));
        }
        if (astral === false) {
          return false;
        }
        return isInAstralSet(code2, astralIdentifierStartCodes);
      }
      function isIdentifierChar(code2, astral) {
        if (code2 < 48) {
          return code2 === 36;
        }
        if (code2 < 58) {
          return true;
        }
        if (code2 < 65) {
          return false;
        }
        if (code2 < 91) {
          return true;
        }
        if (code2 < 97) {
          return code2 === 95;
        }
        if (code2 < 123) {
          return true;
        }
        if (code2 <= 65535) {
          return code2 >= 170 && nonASCIIidentifier.test(String.fromCharCode(code2));
        }
        if (astral === false) {
          return false;
        }
        return isInAstralSet(code2, astralIdentifierStartCodes) || isInAstralSet(code2, astralIdentifierCodes);
      }
      var TokenType = function TokenType2(label, conf) {
        if (conf === void 0) conf = {};
        this.label = label;
        this.keyword = conf.keyword;
        this.beforeExpr = !!conf.beforeExpr;
        this.startsExpr = !!conf.startsExpr;
        this.isLoop = !!conf.isLoop;
        this.isAssign = !!conf.isAssign;
        this.prefix = !!conf.prefix;
        this.postfix = !!conf.postfix;
        this.binop = conf.binop || null;
        this.updateContext = null;
      };
      function binop(name, prec) {
        return new TokenType(name, { beforeExpr: true, binop: prec });
      }
      var beforeExpr = { beforeExpr: true }, startsExpr = { startsExpr: true };
      var keywords$1 = {};
      function kw(name, options) {
        if (options === void 0) options = {};
        options.keyword = name;
        return keywords$1[name] = new TokenType(name, options);
      }
      var types = {
        num: new TokenType("num", startsExpr),
        regexp: new TokenType("regexp", startsExpr),
        string: new TokenType("string", startsExpr),
        name: new TokenType("name", startsExpr),
        eof: new TokenType("eof"),
        // Punctuation token types.
        bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
        bracketR: new TokenType("]"),
        braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
        braceR: new TokenType("}"),
        parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
        parenR: new TokenType(")"),
        comma: new TokenType(",", beforeExpr),
        semi: new TokenType(";", beforeExpr),
        colon: new TokenType(":", beforeExpr),
        dot: new TokenType("."),
        question: new TokenType("?", beforeExpr),
        questionDot: new TokenType("?."),
        arrow: new TokenType("=>", beforeExpr),
        template: new TokenType("template"),
        invalidTemplate: new TokenType("invalidTemplate"),
        ellipsis: new TokenType("...", beforeExpr),
        backQuote: new TokenType("`", startsExpr),
        dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
        // Operators. These carry several kinds of properties to help the
        // parser use them properly (the presence of these properties is
        // what categorizes them as operators).
        //
        // `binop`, when present, specifies that this operator is a binary
        // operator, and will refer to its precedence.
        //
        // `prefix` and `postfix` mark the operator as a prefix or postfix
        // unary operator.
        //
        // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
        // binary operators with a very low precedence, that should result
        // in AssignmentExpression nodes.
        eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
        assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
        incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
        prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
        logicalOR: binop("||", 1),
        logicalAND: binop("&&", 2),
        bitwiseOR: binop("|", 3),
        bitwiseXOR: binop("^", 4),
        bitwiseAND: binop("&", 5),
        equality: binop("==/!=/===/!==", 6),
        relational: binop("</>/<=/>=", 7),
        bitShift: binop("<</>>/>>>", 8),
        plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
        modulo: binop("%", 10),
        star: binop("*", 10),
        slash: binop("/", 10),
        starstar: new TokenType("**", { beforeExpr: true }),
        coalesce: binop("??", 1),
        // Keyword token types.
        _break: kw("break"),
        _case: kw("case", beforeExpr),
        _catch: kw("catch"),
        _continue: kw("continue"),
        _debugger: kw("debugger"),
        _default: kw("default", beforeExpr),
        _do: kw("do", { isLoop: true, beforeExpr: true }),
        _else: kw("else", beforeExpr),
        _finally: kw("finally"),
        _for: kw("for", { isLoop: true }),
        _function: kw("function", startsExpr),
        _if: kw("if"),
        _return: kw("return", beforeExpr),
        _switch: kw("switch"),
        _throw: kw("throw", beforeExpr),
        _try: kw("try"),
        _var: kw("var"),
        _const: kw("const"),
        _while: kw("while", { isLoop: true }),
        _with: kw("with"),
        _new: kw("new", { beforeExpr: true, startsExpr: true }),
        _this: kw("this", startsExpr),
        _super: kw("super", startsExpr),
        _class: kw("class", startsExpr),
        _extends: kw("extends", beforeExpr),
        _export: kw("export"),
        _import: kw("import", startsExpr),
        _null: kw("null", startsExpr),
        _true: kw("true", startsExpr),
        _false: kw("false", startsExpr),
        _in: kw("in", { beforeExpr: true, binop: 7 }),
        _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
        _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
        _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
        _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
      };
      var lineBreak = /\r\n?|\n|\u2028|\u2029/;
      var lineBreakG = new RegExp(lineBreak.source, "g");
      function isNewLine(code2, ecma2019String) {
        return code2 === 10 || code2 === 13 || !ecma2019String && (code2 === 8232 || code2 === 8233);
      }
      var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
      var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
      var ref = Object.prototype;
      var hasOwnProperty = ref.hasOwnProperty;
      var toString = ref.toString;
      function has(obj, propName) {
        return hasOwnProperty.call(obj, propName);
      }
      var isArray = Array.isArray || (function(obj) {
        return toString.call(obj) === "[object Array]";
      });
      function wordsRegexp(words) {
        return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$");
      }
      var Position = function Position2(line, col) {
        this.line = line;
        this.column = col;
      };
      Position.prototype.offset = function offset(n) {
        return new Position(this.line, this.column + n);
      };
      var SourceLocation = function SourceLocation2(p, start, end) {
        this.start = start;
        this.end = end;
        if (p.sourceFile !== null) {
          this.source = p.sourceFile;
        }
      };
      function getLineInfo(input, offset) {
        for (var line = 1, cur = 0; ; ) {
          lineBreakG.lastIndex = cur;
          var match = lineBreakG.exec(input);
          if (match && match.index < offset) {
            ++line;
            cur = match.index + match[0].length;
          } else {
            return new Position(line, offset - cur);
          }
        }
      }
      var defaultOptions = {
        // `ecmaVersion` indicates the ECMAScript version to parse. Must be
        // either 3, 5, 6 (2015), 7 (2016), 8 (2017), 9 (2018), or 10
        // (2019). This influences support for strict mode, the set of
        // reserved words, and support for new syntax features. The default
        // is 10.
        ecmaVersion: 10,
        // `sourceType` indicates the mode the code should be parsed in.
        // Can be either `"script"` or `"module"`. This influences global
        // strict mode and parsing of `import` and `export` declarations.
        sourceType: "script",
        // `onInsertedSemicolon` can be a callback that will be called
        // when a semicolon is automatically inserted. It will be passed
        // the position of the comma as an offset, and if `locations` is
        // enabled, it is given the location as a `{line, column}` object
        // as second argument.
        onInsertedSemicolon: null,
        // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
        // trailing commas.
        onTrailingComma: null,
        // By default, reserved words are only enforced if ecmaVersion >= 5.
        // Set `allowReserved` to a boolean value to explicitly turn this on
        // an off. When this option has the value "never", reserved words
        // and keywords can also not be used as property names.
        allowReserved: null,
        // When enabled, a return at the top level is not considered an
        // error.
        allowReturnOutsideFunction: false,
        // When enabled, import/export statements are not constrained to
        // appearing at the top of the program.
        allowImportExportEverywhere: false,
        // When enabled, await identifiers are allowed to appear at the top-level scope,
        // but they are still not allowed in non-async functions.
        allowAwaitOutsideFunction: false,
        // When enabled, hashbang directive in the beginning of file
        // is allowed and treated as a line comment.
        allowHashBang: false,
        // When `locations` is on, `loc` properties holding objects with
        // `start` and `end` properties in `{line, column}` form (with
        // line being 1-based and column 0-based) will be attached to the
        // nodes.
        locations: false,
        // A function can be passed as `onToken` option, which will
        // cause Acorn to call that function with object in the same
        // format as tokens returned from `tokenizer().getToken()`. Note
        // that you are not allowed to call the parser from the
        // callback—that will corrupt its internal state.
        onToken: null,
        // A function can be passed as `onComment` option, which will
        // cause Acorn to call that function with `(block, text, start,
        // end)` parameters whenever a comment is skipped. `block` is a
        // boolean indicating whether this is a block (`/* */`) comment,
        // `text` is the content of the comment, and `start` and `end` are
        // character offsets that denote the start and end of the comment.
        // When the `locations` option is on, two more parameters are
        // passed, the full `{line, column}` locations of the start and
        // end of the comments. Note that you are not allowed to call the
        // parser from the callback—that will corrupt its internal state.
        onComment: null,
        // Nodes have their start and end characters offsets recorded in
        // `start` and `end` properties (directly on the node, rather than
        // the `loc` object, which holds line/column data. To also add a
        // [semi-standardized][range] `range` property holding a `[start,
        // end]` array with the same numbers, set the `ranges` option to
        // `true`.
        //
        // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
        ranges: false,
        // It is possible to parse multiple files into a single AST by
        // passing the tree produced by parsing the first file as
        // `program` option in subsequent parses. This will add the
        // toplevel forms of the parsed file to the `Program` (top) node
        // of an existing parse tree.
        program: null,
        // When `locations` is on, you can pass this to record the source
        // file in every node's `loc` object.
        sourceFile: null,
        // This value, if given, is stored in every node, whether
        // `locations` is on or off.
        directSourceFile: null,
        // When enabled, parenthesized expressions are represented by
        // (non-standard) ParenthesizedExpression nodes
        preserveParens: false
      };
      function getOptions(opts) {
        var options = {};
        for (var opt in defaultOptions) {
          options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
        }
        if (options.ecmaVersion >= 2015) {
          options.ecmaVersion -= 2009;
        }
        if (options.allowReserved == null) {
          options.allowReserved = options.ecmaVersion < 5;
        }
        if (isArray(options.onToken)) {
          var tokens = options.onToken;
          options.onToken = function(token3) {
            return tokens.push(token3);
          };
        }
        if (isArray(options.onComment)) {
          options.onComment = pushComment(options, options.onComment);
        }
        return options;
      }
      function pushComment(options, array) {
        return function(block, text, start, end, startLoc, endLoc) {
          var comment = {
            type: block ? "Block" : "Line",
            value: text,
            start,
            end
          };
          if (options.locations) {
            comment.loc = new SourceLocation(this, startLoc, endLoc);
          }
          if (options.ranges) {
            comment.range = [start, end];
          }
          array.push(comment);
        };
      }
      var SCOPE_TOP = 1, SCOPE_FUNCTION = 2, SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION, SCOPE_ASYNC = 4, SCOPE_GENERATOR = 8, SCOPE_ARROW = 16, SCOPE_SIMPLE_CATCH = 32, SCOPE_SUPER = 64, SCOPE_DIRECT_SUPER = 128;
      function functionFlags(async, generator) {
        return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
      }
      var BIND_NONE = 0, BIND_VAR = 1, BIND_LEXICAL = 2, BIND_FUNCTION = 3, BIND_SIMPLE_CATCH = 4, BIND_OUTSIDE = 5;
      var Parser = function Parser2(options, input, startPos) {
        this.options = options = getOptions(options);
        this.sourceFile = options.sourceFile;
        this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
        var reserved = "";
        if (options.allowReserved !== true) {
          for (var v = options.ecmaVersion; ; v--) {
            if (reserved = reservedWords[v]) {
              break;
            }
          }
          if (options.sourceType === "module") {
            reserved += " await";
          }
        }
        this.reservedWords = wordsRegexp(reserved);
        var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
        this.reservedWordsStrict = wordsRegexp(reservedStrict);
        this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
        this.input = String(input);
        this.containsEsc = false;
        if (startPos) {
          this.pos = startPos;
          this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
          this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
        } else {
          this.pos = this.lineStart = 0;
          this.curLine = 1;
        }
        this.type = types.eof;
        this.value = null;
        this.start = this.end = this.pos;
        this.startLoc = this.endLoc = this.curPosition();
        this.lastTokEndLoc = this.lastTokStartLoc = null;
        this.lastTokStart = this.lastTokEnd = this.pos;
        this.context = this.initialContext();
        this.exprAllowed = true;
        this.inModule = options.sourceType === "module";
        this.strict = this.inModule || this.strictDirective(this.pos);
        this.potentialArrowAt = -1;
        this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
        this.labels = [];
        this.undefinedExports = {};
        if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
          this.skipLineComment(2);
        }
        this.scopeStack = [];
        this.enterScope(SCOPE_TOP);
        this.regexpState = null;
      };
      var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true } };
      Parser.prototype.parse = function parse2() {
        var node = this.options.program || this.startNode();
        this.nextToken();
        return this.parseTopLevel(node);
      };
      prototypeAccessors.inFunction.get = function() {
        return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
      };
      prototypeAccessors.inGenerator.get = function() {
        return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
      };
      prototypeAccessors.inAsync.get = function() {
        return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
      };
      prototypeAccessors.allowSuper.get = function() {
        return (this.currentThisScope().flags & SCOPE_SUPER) > 0;
      };
      prototypeAccessors.allowDirectSuper.get = function() {
        return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
      };
      prototypeAccessors.treatFunctionsAsVar.get = function() {
        return this.treatFunctionsAsVarInScope(this.currentScope());
      };
      Parser.prototype.inNonArrowFunction = function inNonArrowFunction() {
        return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0;
      };
      Parser.extend = function extend() {
        var plugins = [], len = arguments.length;
        while (len--) plugins[len] = arguments[len];
        var cls = this;
        for (var i = 0; i < plugins.length; i++) {
          cls = plugins[i](cls);
        }
        return cls;
      };
      Parser.parse = function parse2(input, options) {
        return new this(options, input).parse();
      };
      Parser.parseExpressionAt = function parseExpressionAt2(input, pos, options) {
        var parser2 = new this(options, input, pos);
        parser2.nextToken();
        return parser2.parseExpression();
      };
      Parser.tokenizer = function tokenizer2(input, options) {
        return new this(options, input);
      };
      Object.defineProperties(Parser.prototype, prototypeAccessors);
      var pp = Parser.prototype;
      var literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/;
      pp.strictDirective = function(start) {
        for (; ; ) {
          skipWhiteSpace.lastIndex = start;
          start += skipWhiteSpace.exec(this.input)[0].length;
          var match = literal.exec(this.input.slice(start));
          if (!match) {
            return false;
          }
          if ((match[1] || match[2]) === "use strict") {
            skipWhiteSpace.lastIndex = start + match[0].length;
            var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
            var next = this.input.charAt(end);
            return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
          }
          start += match[0].length;
          skipWhiteSpace.lastIndex = start;
          start += skipWhiteSpace.exec(this.input)[0].length;
          if (this.input[start] === ";") {
            start++;
          }
        }
      };
      pp.eat = function(type) {
        if (this.type === type) {
          this.next();
          return true;
        } else {
          return false;
        }
      };
      pp.isContextual = function(name) {
        return this.type === types.name && this.value === name && !this.containsEsc;
      };
      pp.eatContextual = function(name) {
        if (!this.isContextual(name)) {
          return false;
        }
        this.next();
        return true;
      };
      pp.expectContextual = function(name) {
        if (!this.eatContextual(name)) {
          this.unexpected();
        }
      };
      pp.canInsertSemicolon = function() {
        return this.type === types.eof || this.type === types.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      };
      pp.insertSemicolon = function() {
        if (this.canInsertSemicolon()) {
          if (this.options.onInsertedSemicolon) {
            this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
          }
          return true;
        }
      };
      pp.semicolon = function() {
        if (!this.eat(types.semi) && !this.insertSemicolon()) {
          this.unexpected();
        }
      };
      pp.afterTrailingComma = function(tokType, notNext) {
        if (this.type === tokType) {
          if (this.options.onTrailingComma) {
            this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
          }
          if (!notNext) {
            this.next();
          }
          return true;
        }
      };
      pp.expect = function(type) {
        this.eat(type) || this.unexpected();
      };
      pp.unexpected = function(pos) {
        this.raise(pos != null ? pos : this.start, "Unexpected token");
      };
      function DestructuringErrors() {
        this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
      }
      pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
        if (!refDestructuringErrors) {
          return;
        }
        if (refDestructuringErrors.trailingComma > -1) {
          this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
        }
        var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
        if (parens > -1) {
          this.raiseRecoverable(parens, "Parenthesized pattern");
        }
      };
      pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
        if (!refDestructuringErrors) {
          return false;
        }
        var shorthandAssign = refDestructuringErrors.shorthandAssign;
        var doubleProto = refDestructuringErrors.doubleProto;
        if (!andThrow) {
          return shorthandAssign >= 0 || doubleProto >= 0;
        }
        if (shorthandAssign >= 0) {
          this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
        }
        if (doubleProto >= 0) {
          this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
        }
      };
      pp.checkYieldAwaitInDefaultParams = function() {
        if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
          this.raise(this.yieldPos, "Yield expression cannot be a default value");
        }
        if (this.awaitPos) {
          this.raise(this.awaitPos, "Await expression cannot be a default value");
        }
      };
      pp.isSimpleAssignTarget = function(expr) {
        if (expr.type === "ParenthesizedExpression") {
          return this.isSimpleAssignTarget(expr.expression);
        }
        return expr.type === "Identifier" || expr.type === "MemberExpression";
      };
      var pp$1 = Parser.prototype;
      pp$1.parseTopLevel = function(node) {
        var exports5 = {};
        if (!node.body) {
          node.body = [];
        }
        while (this.type !== types.eof) {
          var stmt = this.parseStatement(null, true, exports5);
          node.body.push(stmt);
        }
        if (this.inModule) {
          for (var i = 0, list2 = Object.keys(this.undefinedExports); i < list2.length; i += 1) {
            var name = list2[i];
            this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
          }
        }
        this.adaptDirectivePrologue(node.body);
        this.next();
        node.sourceType = this.options.sourceType;
        return this.finishNode(node, "Program");
      };
      var loopLabel = { kind: "loop" }, switchLabel = { kind: "switch" };
      pp$1.isLet = function(context) {
        if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
          return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 91) {
          return true;
        }
        if (context) {
          return false;
        }
        if (nextCh === 123) {
          return true;
        }
        if (isIdentifierStart(nextCh, true)) {
          var pos = next + 1;
          while (isIdentifierChar(this.input.charCodeAt(pos), true)) {
            ++pos;
          }
          var ident = this.input.slice(next, pos);
          if (!keywordRelationalOperator.test(ident)) {
            return true;
          }
        }
        return false;
      };
      pp$1.isAsyncFunction = function() {
        if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
          return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length;
        return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)));
      };
      pp$1.parseStatement = function(context, topLevel, exports5) {
        var starttype = this.type, node = this.startNode(), kind;
        if (this.isLet(context)) {
          starttype = types._var;
          kind = "let";
        }
        switch (starttype) {
          case types._break:
          case types._continue:
            return this.parseBreakContinueStatement(node, starttype.keyword);
          case types._debugger:
            return this.parseDebuggerStatement(node);
          case types._do:
            return this.parseDoStatement(node);
          case types._for:
            return this.parseForStatement(node);
          case types._function:
            if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
              this.unexpected();
            }
            return this.parseFunctionStatement(node, false, !context);
          case types._class:
            if (context) {
              this.unexpected();
            }
            return this.parseClass(node, true);
          case types._if:
            return this.parseIfStatement(node);
          case types._return:
            return this.parseReturnStatement(node);
          case types._switch:
            return this.parseSwitchStatement(node);
          case types._throw:
            return this.parseThrowStatement(node);
          case types._try:
            return this.parseTryStatement(node);
          case types._const:
          case types._var:
            kind = kind || this.value;
            if (context && kind !== "var") {
              this.unexpected();
            }
            return this.parseVarStatement(node, kind);
          case types._while:
            return this.parseWhileStatement(node);
          case types._with:
            return this.parseWithStatement(node);
          case types.braceL:
            return this.parseBlock(true, node);
          case types.semi:
            return this.parseEmptyStatement(node);
          case types._export:
          case types._import:
            if (this.options.ecmaVersion > 10 && starttype === types._import) {
              skipWhiteSpace.lastIndex = this.pos;
              var skip = skipWhiteSpace.exec(this.input);
              var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
              if (nextCh === 40 || nextCh === 46) {
                return this.parseExpressionStatement(node, this.parseExpression());
              }
            }
            if (!this.options.allowImportExportEverywhere) {
              if (!topLevel) {
                this.raise(this.start, "'import' and 'export' may only appear at the top level");
              }
              if (!this.inModule) {
                this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
              }
            }
            return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports5);
          // If the statement does not start with a statement keyword or a
          // brace, it's an ExpressionStatement or LabeledStatement. We
          // simply start parsing an expression, and afterwards, if the
          // next token is a colon and the expression was a simple
          // Identifier node, we switch to interpreting it as a label.
          default:
            if (this.isAsyncFunction()) {
              if (context) {
                this.unexpected();
              }
              this.next();
              return this.parseFunctionStatement(node, true, !context);
            }
            var maybeName = this.value, expr = this.parseExpression();
            if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon)) {
              return this.parseLabeledStatement(node, maybeName, expr, context);
            } else {
              return this.parseExpressionStatement(node, expr);
            }
        }
      };
      pp$1.parseBreakContinueStatement = function(node, keyword) {
        var isBreak = keyword === "break";
        this.next();
        if (this.eat(types.semi) || this.insertSemicolon()) {
          node.label = null;
        } else if (this.type !== types.name) {
          this.unexpected();
        } else {
          node.label = this.parseIdent();
          this.semicolon();
        }
        var i = 0;
        for (; i < this.labels.length; ++i) {
          var lab = this.labels[i];
          if (node.label == null || lab.name === node.label.name) {
            if (lab.kind != null && (isBreak || lab.kind === "loop")) {
              break;
            }
            if (node.label && isBreak) {
              break;
            }
          }
        }
        if (i === this.labels.length) {
          this.raise(node.start, "Unsyntactic " + keyword);
        }
        return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
      };
      pp$1.parseDebuggerStatement = function(node) {
        this.next();
        this.semicolon();
        return this.finishNode(node, "DebuggerStatement");
      };
      pp$1.parseDoStatement = function(node) {
        this.next();
        this.labels.push(loopLabel);
        node.body = this.parseStatement("do");
        this.labels.pop();
        this.expect(types._while);
        node.test = this.parseParenExpression();
        if (this.options.ecmaVersion >= 6) {
          this.eat(types.semi);
        } else {
          this.semicolon();
        }
        return this.finishNode(node, "DoWhileStatement");
      };
      pp$1.parseForStatement = function(node) {
        this.next();
        var awaitAt = this.options.ecmaVersion >= 9 && (this.inAsync || !this.inFunction && this.options.allowAwaitOutsideFunction) && this.eatContextual("await") ? this.lastTokStart : -1;
        this.labels.push(loopLabel);
        this.enterScope(0);
        this.expect(types.parenL);
        if (this.type === types.semi) {
          if (awaitAt > -1) {
            this.unexpected(awaitAt);
          }
          return this.parseFor(node, null);
        }
        var isLet = this.isLet();
        if (this.type === types._var || this.type === types._const || isLet) {
          var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
          this.next();
          this.parseVar(init$1, true, kind);
          this.finishNode(init$1, "VariableDeclaration");
          if ((this.type === types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init$1.declarations.length === 1) {
            if (this.options.ecmaVersion >= 9) {
              if (this.type === types._in) {
                if (awaitAt > -1) {
                  this.unexpected(awaitAt);
                }
              } else {
                node.await = awaitAt > -1;
              }
            }
            return this.parseForIn(node, init$1);
          }
          if (awaitAt > -1) {
            this.unexpected(awaitAt);
          }
          return this.parseFor(node, init$1);
        }
        var refDestructuringErrors = new DestructuringErrors();
        var init = this.parseExpression(true, refDestructuringErrors);
        if (this.type === types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
          if (this.options.ecmaVersion >= 9) {
            if (this.type === types._in) {
              if (awaitAt > -1) {
                this.unexpected(awaitAt);
              }
            } else {
              node.await = awaitAt > -1;
            }
          }
          this.toAssignable(init, false, refDestructuringErrors);
          this.checkLVal(init);
          return this.parseForIn(node, init);
        } else {
          this.checkExpressionErrors(refDestructuringErrors, true);
        }
        if (awaitAt > -1) {
          this.unexpected(awaitAt);
        }
        return this.parseFor(node, init);
      };
      pp$1.parseFunctionStatement = function(node, isAsync, declarationPosition) {
        this.next();
        return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
      };
      pp$1.parseIfStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        node.consequent = this.parseStatement("if");
        node.alternate = this.eat(types._else) ? this.parseStatement("if") : null;
        return this.finishNode(node, "IfStatement");
      };
      pp$1.parseReturnStatement = function(node) {
        if (!this.inFunction && !this.options.allowReturnOutsideFunction) {
          this.raise(this.start, "'return' outside of function");
        }
        this.next();
        if (this.eat(types.semi) || this.insertSemicolon()) {
          node.argument = null;
        } else {
          node.argument = this.parseExpression();
          this.semicolon();
        }
        return this.finishNode(node, "ReturnStatement");
      };
      pp$1.parseSwitchStatement = function(node) {
        this.next();
        node.discriminant = this.parseParenExpression();
        node.cases = [];
        this.expect(types.braceL);
        this.labels.push(switchLabel);
        this.enterScope(0);
        var cur;
        for (var sawDefault = false; this.type !== types.braceR; ) {
          if (this.type === types._case || this.type === types._default) {
            var isCase = this.type === types._case;
            if (cur) {
              this.finishNode(cur, "SwitchCase");
            }
            node.cases.push(cur = this.startNode());
            cur.consequent = [];
            this.next();
            if (isCase) {
              cur.test = this.parseExpression();
            } else {
              if (sawDefault) {
                this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
              }
              sawDefault = true;
              cur.test = null;
            }
            this.expect(types.colon);
          } else {
            if (!cur) {
              this.unexpected();
            }
            cur.consequent.push(this.parseStatement(null));
          }
        }
        this.exitScope();
        if (cur) {
          this.finishNode(cur, "SwitchCase");
        }
        this.next();
        this.labels.pop();
        return this.finishNode(node, "SwitchStatement");
      };
      pp$1.parseThrowStatement = function(node) {
        this.next();
        if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
          this.raise(this.lastTokEnd, "Illegal newline after throw");
        }
        node.argument = this.parseExpression();
        this.semicolon();
        return this.finishNode(node, "ThrowStatement");
      };
      var empty = [];
      pp$1.parseTryStatement = function(node) {
        this.next();
        node.block = this.parseBlock();
        node.handler = null;
        if (this.type === types._catch) {
          var clause = this.startNode();
          this.next();
          if (this.eat(types.parenL)) {
            clause.param = this.parseBindingAtom();
            var simple = clause.param.type === "Identifier";
            this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
            this.checkLVal(clause.param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
            this.expect(types.parenR);
          } else {
            if (this.options.ecmaVersion < 10) {
              this.unexpected();
            }
            clause.param = null;
            this.enterScope(0);
          }
          clause.body = this.parseBlock(false);
          this.exitScope();
          node.handler = this.finishNode(clause, "CatchClause");
        }
        node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
        if (!node.handler && !node.finalizer) {
          this.raise(node.start, "Missing catch or finally clause");
        }
        return this.finishNode(node, "TryStatement");
      };
      pp$1.parseVarStatement = function(node, kind) {
        this.next();
        this.parseVar(node, false, kind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      };
      pp$1.parseWhileStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        this.labels.push(loopLabel);
        node.body = this.parseStatement("while");
        this.labels.pop();
        return this.finishNode(node, "WhileStatement");
      };
      pp$1.parseWithStatement = function(node) {
        if (this.strict) {
          this.raise(this.start, "'with' in strict mode");
        }
        this.next();
        node.object = this.parseParenExpression();
        node.body = this.parseStatement("with");
        return this.finishNode(node, "WithStatement");
      };
      pp$1.parseEmptyStatement = function(node) {
        this.next();
        return this.finishNode(node, "EmptyStatement");
      };
      pp$1.parseLabeledStatement = function(node, maybeName, expr, context) {
        for (var i$1 = 0, list2 = this.labels; i$1 < list2.length; i$1 += 1) {
          var label = list2[i$1];
          if (label.name === maybeName) {
            this.raise(expr.start, "Label '" + maybeName + "' is already declared");
          }
        }
        var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
        for (var i = this.labels.length - 1; i >= 0; i--) {
          var label$1 = this.labels[i];
          if (label$1.statementStart === node.start) {
            label$1.statementStart = this.start;
            label$1.kind = kind;
          } else {
            break;
          }
        }
        this.labels.push({ name: maybeName, kind, statementStart: this.start });
        node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
        this.labels.pop();
        node.label = expr;
        return this.finishNode(node, "LabeledStatement");
      };
      pp$1.parseExpressionStatement = function(node, expr) {
        node.expression = expr;
        this.semicolon();
        return this.finishNode(node, "ExpressionStatement");
      };
      pp$1.parseBlock = function(createNewLexicalScope, node, exitStrict) {
        if (createNewLexicalScope === void 0) createNewLexicalScope = true;
        if (node === void 0) node = this.startNode();
        node.body = [];
        this.expect(types.braceL);
        if (createNewLexicalScope) {
          this.enterScope(0);
        }
        while (this.type !== types.braceR) {
          var stmt = this.parseStatement(null);
          node.body.push(stmt);
        }
        if (exitStrict) {
          this.strict = false;
        }
        this.next();
        if (createNewLexicalScope) {
          this.exitScope();
        }
        return this.finishNode(node, "BlockStatement");
      };
      pp$1.parseFor = function(node, init) {
        node.init = init;
        this.expect(types.semi);
        node.test = this.type === types.semi ? null : this.parseExpression();
        this.expect(types.semi);
        node.update = this.type === types.parenR ? null : this.parseExpression();
        this.expect(types.parenR);
        node.body = this.parseStatement("for");
        this.exitScope();
        this.labels.pop();
        return this.finishNode(node, "ForStatement");
      };
      pp$1.parseForIn = function(node, init) {
        var isForIn = this.type === types._in;
        this.next();
        if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
          this.raise(
            init.start,
            (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
          );
        } else if (init.type === "AssignmentPattern") {
          this.raise(init.start, "Invalid left-hand side in for-loop");
        }
        node.left = init;
        node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
        this.expect(types.parenR);
        node.body = this.parseStatement("for");
        this.exitScope();
        this.labels.pop();
        return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
      };
      pp$1.parseVar = function(node, isFor, kind) {
        node.declarations = [];
        node.kind = kind;
        for (; ; ) {
          var decl = this.startNode();
          this.parseVarId(decl, kind);
          if (this.eat(types.eq)) {
            decl.init = this.parseMaybeAssign(isFor);
          } else if (kind === "const" && !(this.type === types._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
            this.unexpected();
          } else if (decl.id.type !== "Identifier" && !(isFor && (this.type === types._in || this.isContextual("of")))) {
            this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
          } else {
            decl.init = null;
          }
          node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
          if (!this.eat(types.comma)) {
            break;
          }
        }
        return node;
      };
      pp$1.parseVarId = function(decl, kind) {
        decl.id = this.parseBindingAtom();
        this.checkLVal(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
      };
      var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;
      pp$1.parseFunction = function(node, statement, allowExpressionBody, isAsync) {
        this.initFunction(node);
        if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
          if (this.type === types.star && statement & FUNC_HANGING_STATEMENT) {
            this.unexpected();
          }
          node.generator = this.eat(types.star);
        }
        if (this.options.ecmaVersion >= 8) {
          node.async = !!isAsync;
        }
        if (statement & FUNC_STATEMENT) {
          node.id = statement & FUNC_NULLABLE_ID && this.type !== types.name ? null : this.parseIdent();
          if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
            this.checkLVal(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
          }
        }
        var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        this.enterScope(functionFlags(node.async, node.generator));
        if (!(statement & FUNC_STATEMENT)) {
          node.id = this.type === types.name ? this.parseIdent() : null;
        }
        this.parseFunctionParams(node);
        this.parseFunctionBody(node, allowExpressionBody, false);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
      };
      pp$1.parseFunctionParams = function(node) {
        this.expect(types.parenL);
        node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
        this.checkYieldAwaitInDefaultParams();
      };
      pp$1.parseClass = function(node, isStatement) {
        this.next();
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, isStatement);
        this.parseClassSuper(node);
        var classBody = this.startNode();
        var hadConstructor = false;
        classBody.body = [];
        this.expect(types.braceL);
        while (this.type !== types.braceR) {
          var element = this.parseClassElement(node.superClass !== null);
          if (element) {
            classBody.body.push(element);
            if (element.type === "MethodDefinition" && element.kind === "constructor") {
              if (hadConstructor) {
                this.raise(element.start, "Duplicate constructor in the same class");
              }
              hadConstructor = true;
            }
          }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "ClassBody");
        return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
      };
      pp$1.parseClassElement = function(constructorAllowsSuper) {
        var this$1 = this;
        if (this.eat(types.semi)) {
          return null;
        }
        var method = this.startNode();
        var tryContextual = function(k, noLineBreak) {
          if (noLineBreak === void 0) noLineBreak = false;
          var start = this$1.start, startLoc = this$1.startLoc;
          if (!this$1.eatContextual(k)) {
            return false;
          }
          if (this$1.type !== types.parenL && (!noLineBreak || !this$1.canInsertSemicolon())) {
            return true;
          }
          if (method.key) {
            this$1.unexpected();
          }
          method.computed = false;
          method.key = this$1.startNodeAt(start, startLoc);
          method.key.name = k;
          this$1.finishNode(method.key, "Identifier");
          return false;
        };
        method.kind = "method";
        method.static = tryContextual("static");
        var isGenerator = this.eat(types.star);
        var isAsync = false;
        if (!isGenerator) {
          if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
            isAsync = true;
            isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
          } else if (tryContextual("get")) {
            method.kind = "get";
          } else if (tryContextual("set")) {
            method.kind = "set";
          }
        }
        if (!method.key) {
          this.parsePropertyName(method);
        }
        var key = method.key;
        var allowsDirectSuper = false;
        if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
          if (method.kind !== "method") {
            this.raise(key.start, "Constructor can't have get/set modifier");
          }
          if (isGenerator) {
            this.raise(key.start, "Constructor can't be a generator");
          }
          if (isAsync) {
            this.raise(key.start, "Constructor can't be an async method");
          }
          method.kind = "constructor";
          allowsDirectSuper = constructorAllowsSuper;
        } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
          this.raise(key.start, "Classes may not have a static property named prototype");
        }
        this.parseClassMethod(method, isGenerator, isAsync, allowsDirectSuper);
        if (method.kind === "get" && method.value.params.length !== 0) {
          this.raiseRecoverable(method.value.start, "getter should have no params");
        }
        if (method.kind === "set" && method.value.params.length !== 1) {
          this.raiseRecoverable(method.value.start, "setter should have exactly one param");
        }
        if (method.kind === "set" && method.value.params[0].type === "RestElement") {
          this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params");
        }
        return method;
      };
      pp$1.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
        method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
        return this.finishNode(method, "MethodDefinition");
      };
      pp$1.parseClassId = function(node, isStatement) {
        if (this.type === types.name) {
          node.id = this.parseIdent();
          if (isStatement) {
            this.checkLVal(node.id, BIND_LEXICAL, false);
          }
        } else {
          if (isStatement === true) {
            this.unexpected();
          }
          node.id = null;
        }
      };
      pp$1.parseClassSuper = function(node) {
        node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
      };
      pp$1.parseExport = function(node, exports5) {
        this.next();
        if (this.eat(types.star)) {
          if (this.options.ecmaVersion >= 11) {
            if (this.eatContextual("as")) {
              node.exported = this.parseIdent(true);
              this.checkExport(exports5, node.exported.name, this.lastTokStart);
            } else {
              node.exported = null;
            }
          }
          this.expectContextual("from");
          if (this.type !== types.string) {
            this.unexpected();
          }
          node.source = this.parseExprAtom();
          this.semicolon();
          return this.finishNode(node, "ExportAllDeclaration");
        }
        if (this.eat(types._default)) {
          this.checkExport(exports5, "default", this.lastTokStart);
          var isAsync;
          if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
            var fNode = this.startNode();
            this.next();
            if (isAsync) {
              this.next();
            }
            node.declaration = this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
          } else if (this.type === types._class) {
            var cNode = this.startNode();
            node.declaration = this.parseClass(cNode, "nullableID");
          } else {
            node.declaration = this.parseMaybeAssign();
            this.semicolon();
          }
          return this.finishNode(node, "ExportDefaultDeclaration");
        }
        if (this.shouldParseExportStatement()) {
          node.declaration = this.parseStatement(null);
          if (node.declaration.type === "VariableDeclaration") {
            this.checkVariableExport(exports5, node.declaration.declarations);
          } else {
            this.checkExport(exports5, node.declaration.id.name, node.declaration.id.start);
          }
          node.specifiers = [];
          node.source = null;
        } else {
          node.declaration = null;
          node.specifiers = this.parseExportSpecifiers(exports5);
          if (this.eatContextual("from")) {
            if (this.type !== types.string) {
              this.unexpected();
            }
            node.source = this.parseExprAtom();
          } else {
            for (var i = 0, list2 = node.specifiers; i < list2.length; i += 1) {
              var spec = list2[i];
              this.checkUnreserved(spec.local);
              this.checkLocalExport(spec.local);
            }
            node.source = null;
          }
          this.semicolon();
        }
        return this.finishNode(node, "ExportNamedDeclaration");
      };
      pp$1.checkExport = function(exports5, name, pos) {
        if (!exports5) {
          return;
        }
        if (has(exports5, name)) {
          this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
        }
        exports5[name] = true;
      };
      pp$1.checkPatternExport = function(exports5, pat) {
        var type = pat.type;
        if (type === "Identifier") {
          this.checkExport(exports5, pat.name, pat.start);
        } else if (type === "ObjectPattern") {
          for (var i = 0, list2 = pat.properties; i < list2.length; i += 1) {
            var prop = list2[i];
            this.checkPatternExport(exports5, prop);
          }
        } else if (type === "ArrayPattern") {
          for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
            var elt = list$1[i$1];
            if (elt) {
              this.checkPatternExport(exports5, elt);
            }
          }
        } else if (type === "Property") {
          this.checkPatternExport(exports5, pat.value);
        } else if (type === "AssignmentPattern") {
          this.checkPatternExport(exports5, pat.left);
        } else if (type === "RestElement") {
          this.checkPatternExport(exports5, pat.argument);
        } else if (type === "ParenthesizedExpression") {
          this.checkPatternExport(exports5, pat.expression);
        }
      };
      pp$1.checkVariableExport = function(exports5, decls) {
        if (!exports5) {
          return;
        }
        for (var i = 0, list2 = decls; i < list2.length; i += 1) {
          var decl = list2[i];
          this.checkPatternExport(exports5, decl.id);
        }
      };
      pp$1.shouldParseExportStatement = function() {
        return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
      };
      pp$1.parseExportSpecifiers = function(exports5) {
        var nodes = [], first = true;
        this.expect(types.braceL);
        while (!this.eat(types.braceR)) {
          if (!first) {
            this.expect(types.comma);
            if (this.afterTrailingComma(types.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          var node = this.startNode();
          node.local = this.parseIdent(true);
          node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
          this.checkExport(exports5, node.exported.name, node.exported.start);
          nodes.push(this.finishNode(node, "ExportSpecifier"));
        }
        return nodes;
      };
      pp$1.parseImport = function(node) {
        this.next();
        if (this.type === types.string) {
          node.specifiers = empty;
          node.source = this.parseExprAtom();
        } else {
          node.specifiers = this.parseImportSpecifiers();
          this.expectContextual("from");
          node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
        }
        this.semicolon();
        return this.finishNode(node, "ImportDeclaration");
      };
      pp$1.parseImportSpecifiers = function() {
        var nodes = [], first = true;
        if (this.type === types.name) {
          var node = this.startNode();
          node.local = this.parseIdent();
          this.checkLVal(node.local, BIND_LEXICAL);
          nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
          if (!this.eat(types.comma)) {
            return nodes;
          }
        }
        if (this.type === types.star) {
          var node$1 = this.startNode();
          this.next();
          this.expectContextual("as");
          node$1.local = this.parseIdent();
          this.checkLVal(node$1.local, BIND_LEXICAL);
          nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
          return nodes;
        }
        this.expect(types.braceL);
        while (!this.eat(types.braceR)) {
          if (!first) {
            this.expect(types.comma);
            if (this.afterTrailingComma(types.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          var node$2 = this.startNode();
          node$2.imported = this.parseIdent(true);
          if (this.eatContextual("as")) {
            node$2.local = this.parseIdent();
          } else {
            this.checkUnreserved(node$2.imported);
            node$2.local = node$2.imported;
          }
          this.checkLVal(node$2.local, BIND_LEXICAL);
          nodes.push(this.finishNode(node$2, "ImportSpecifier"));
        }
        return nodes;
      };
      pp$1.adaptDirectivePrologue = function(statements) {
        for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
          statements[i].directive = statements[i].expression.raw.slice(1, -1);
        }
      };
      pp$1.isDirectiveCandidate = function(statement) {
        return statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
        (this.input[statement.start] === '"' || this.input[statement.start] === "'");
      };
      var pp$2 = Parser.prototype;
      pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
        if (this.options.ecmaVersion >= 6 && node) {
          switch (node.type) {
            case "Identifier":
              if (this.inAsync && node.name === "await") {
                this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
              }
              break;
            case "ObjectPattern":
            case "ArrayPattern":
            case "RestElement":
              break;
            case "ObjectExpression":
              node.type = "ObjectPattern";
              if (refDestructuringErrors) {
                this.checkPatternErrors(refDestructuringErrors, true);
              }
              for (var i = 0, list2 = node.properties; i < list2.length; i += 1) {
                var prop = list2[i];
                this.toAssignable(prop, isBinding);
                if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
                  this.raise(prop.argument.start, "Unexpected token");
                }
              }
              break;
            case "Property":
              if (node.kind !== "init") {
                this.raise(node.key.start, "Object pattern can't contain getter or setter");
              }
              this.toAssignable(node.value, isBinding);
              break;
            case "ArrayExpression":
              node.type = "ArrayPattern";
              if (refDestructuringErrors) {
                this.checkPatternErrors(refDestructuringErrors, true);
              }
              this.toAssignableList(node.elements, isBinding);
              break;
            case "SpreadElement":
              node.type = "RestElement";
              this.toAssignable(node.argument, isBinding);
              if (node.argument.type === "AssignmentPattern") {
                this.raise(node.argument.start, "Rest elements cannot have a default value");
              }
              break;
            case "AssignmentExpression":
              if (node.operator !== "=") {
                this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
              }
              node.type = "AssignmentPattern";
              delete node.operator;
              this.toAssignable(node.left, isBinding);
            // falls through to AssignmentPattern
            case "AssignmentPattern":
              break;
            case "ParenthesizedExpression":
              this.toAssignable(node.expression, isBinding, refDestructuringErrors);
              break;
            case "ChainExpression":
              this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
              break;
            case "MemberExpression":
              if (!isBinding) {
                break;
              }
            default:
              this.raise(node.start, "Assigning to rvalue");
          }
        } else if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        return node;
      };
      pp$2.toAssignableList = function(exprList, isBinding) {
        var end = exprList.length;
        for (var i = 0; i < end; i++) {
          var elt = exprList[i];
          if (elt) {
            this.toAssignable(elt, isBinding);
          }
        }
        if (end) {
          var last = exprList[end - 1];
          if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
            this.unexpected(last.argument.start);
          }
        }
        return exprList;
      };
      pp$2.parseSpread = function(refDestructuringErrors) {
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
        return this.finishNode(node, "SpreadElement");
      };
      pp$2.parseRestBinding = function() {
        var node = this.startNode();
        this.next();
        if (this.options.ecmaVersion === 6 && this.type !== types.name) {
          this.unexpected();
        }
        node.argument = this.parseBindingAtom();
        return this.finishNode(node, "RestElement");
      };
      pp$2.parseBindingAtom = function() {
        if (this.options.ecmaVersion >= 6) {
          switch (this.type) {
            case types.bracketL:
              var node = this.startNode();
              this.next();
              node.elements = this.parseBindingList(types.bracketR, true, true);
              return this.finishNode(node, "ArrayPattern");
            case types.braceL:
              return this.parseObj(true);
          }
        }
        return this.parseIdent();
      };
      pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
        var elts = [], first = true;
        while (!this.eat(close)) {
          if (first) {
            first = false;
          } else {
            this.expect(types.comma);
          }
          if (allowEmpty && this.type === types.comma) {
            elts.push(null);
          } else if (allowTrailingComma && this.afterTrailingComma(close)) {
            break;
          } else if (this.type === types.ellipsis) {
            var rest = this.parseRestBinding();
            this.parseBindingListItem(rest);
            elts.push(rest);
            if (this.type === types.comma) {
              this.raise(this.start, "Comma is not permitted after the rest element");
            }
            this.expect(close);
            break;
          } else {
            var elem = this.parseMaybeDefault(this.start, this.startLoc);
            this.parseBindingListItem(elem);
            elts.push(elem);
          }
        }
        return elts;
      };
      pp$2.parseBindingListItem = function(param) {
        return param;
      };
      pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
        left = left || this.parseBindingAtom();
        if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) {
          return left;
        }
        var node = this.startNodeAt(startPos, startLoc);
        node.left = left;
        node.right = this.parseMaybeAssign();
        return this.finishNode(node, "AssignmentPattern");
      };
      pp$2.checkLVal = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        switch (expr.type) {
          case "Identifier":
            if (bindingType === BIND_LEXICAL && expr.name === "let") {
              this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
            }
            if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
              this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
            }
            if (checkClashes) {
              if (has(checkClashes, expr.name)) {
                this.raiseRecoverable(expr.start, "Argument name clash");
              }
              checkClashes[expr.name] = true;
            }
            if (bindingType !== BIND_NONE && bindingType !== BIND_OUTSIDE) {
              this.declareName(expr.name, bindingType, expr.start);
            }
            break;
          case "ChainExpression":
            this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
            break;
          case "MemberExpression":
            if (bindingType) {
              this.raiseRecoverable(expr.start, "Binding member expression");
            }
            break;
          case "ObjectPattern":
            for (var i = 0, list2 = expr.properties; i < list2.length; i += 1) {
              var prop = list2[i];
              this.checkLVal(prop, bindingType, checkClashes);
            }
            break;
          case "Property":
            this.checkLVal(expr.value, bindingType, checkClashes);
            break;
          case "ArrayPattern":
            for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
              var elem = list$1[i$1];
              if (elem) {
                this.checkLVal(elem, bindingType, checkClashes);
              }
            }
            break;
          case "AssignmentPattern":
            this.checkLVal(expr.left, bindingType, checkClashes);
            break;
          case "RestElement":
            this.checkLVal(expr.argument, bindingType, checkClashes);
            break;
          case "ParenthesizedExpression":
            this.checkLVal(expr.expression, bindingType, checkClashes);
            break;
          default:
            this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
        }
      };
      var pp$3 = Parser.prototype;
      pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
        if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
          return;
        }
        if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
          return;
        }
        var key = prop.key;
        var name;
        switch (key.type) {
          case "Identifier":
            name = key.name;
            break;
          case "Literal":
            name = String(key.value);
            break;
          default:
            return;
        }
        var kind = prop.kind;
        if (this.options.ecmaVersion >= 6) {
          if (name === "__proto__" && kind === "init") {
            if (propHash.proto) {
              if (refDestructuringErrors) {
                if (refDestructuringErrors.doubleProto < 0) {
                  refDestructuringErrors.doubleProto = key.start;
                }
              } else {
                this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
              }
            }
            propHash.proto = true;
          }
          return;
        }
        name = "$" + name;
        var other = propHash[name];
        if (other) {
          var redefinition;
          if (kind === "init") {
            redefinition = this.strict && other.init || other.get || other.set;
          } else {
            redefinition = other.init || other[kind];
          }
          if (redefinition) {
            this.raiseRecoverable(key.start, "Redefinition of property");
          }
        } else {
          other = propHash[name] = {
            init: false,
            get: false,
            set: false
          };
        }
        other[kind] = true;
      };
      pp$3.parseExpression = function(noIn, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
        if (this.type === types.comma) {
          var node = this.startNodeAt(startPos, startLoc);
          node.expressions = [expr];
          while (this.eat(types.comma)) {
            node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
          }
          return this.finishNode(node, "SequenceExpression");
        }
        return expr;
      };
      pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
        if (this.isContextual("yield")) {
          if (this.inGenerator) {
            return this.parseYield(noIn);
          } else {
            this.exprAllowed = false;
          }
        }
        var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1;
        if (refDestructuringErrors) {
          oldParenAssign = refDestructuringErrors.parenthesizedAssign;
          oldTrailingComma = refDestructuringErrors.trailingComma;
          refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
        } else {
          refDestructuringErrors = new DestructuringErrors();
          ownDestructuringErrors = true;
        }
        var startPos = this.start, startLoc = this.startLoc;
        if (this.type === types.parenL || this.type === types.name) {
          this.potentialArrowAt = this.start;
        }
        var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
        if (afterLeftParse) {
          left = afterLeftParse.call(this, left, startPos, startLoc);
        }
        if (this.type.isAssign) {
          var node = this.startNodeAt(startPos, startLoc);
          node.operator = this.value;
          node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
          if (!ownDestructuringErrors) {
            refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
          }
          if (refDestructuringErrors.shorthandAssign >= node.left.start) {
            refDestructuringErrors.shorthandAssign = -1;
          }
          this.checkLVal(left);
          this.next();
          node.right = this.parseMaybeAssign(noIn);
          return this.finishNode(node, "AssignmentExpression");
        } else {
          if (ownDestructuringErrors) {
            this.checkExpressionErrors(refDestructuringErrors, true);
          }
        }
        if (oldParenAssign > -1) {
          refDestructuringErrors.parenthesizedAssign = oldParenAssign;
        }
        if (oldTrailingComma > -1) {
          refDestructuringErrors.trailingComma = oldTrailingComma;
        }
        return left;
      };
      pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseExprOps(noIn, refDestructuringErrors);
        if (this.checkExpressionErrors(refDestructuringErrors)) {
          return expr;
        }
        if (this.eat(types.question)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.test = expr;
          node.consequent = this.parseMaybeAssign();
          this.expect(types.colon);
          node.alternate = this.parseMaybeAssign(noIn);
          return this.finishNode(node, "ConditionalExpression");
        }
        return expr;
      };
      pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseMaybeUnary(refDestructuringErrors, false);
        if (this.checkExpressionErrors(refDestructuringErrors)) {
          return expr;
        }
        return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn);
      };
      pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
        var prec = this.type.binop;
        if (prec != null && (!noIn || this.type !== types._in)) {
          if (prec > minPrec) {
            var logical = this.type === types.logicalOR || this.type === types.logicalAND;
            var coalesce = this.type === types.coalesce;
            if (coalesce) {
              prec = types.logicalAND.binop;
            }
            var op = this.value;
            this.next();
            var startPos = this.start, startLoc = this.startLoc;
            var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
            var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
            if (logical && this.type === types.coalesce || coalesce && (this.type === types.logicalOR || this.type === types.logicalAND)) {
              this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
            }
            return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
          }
        }
        return left;
      };
      pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
        var node = this.startNodeAt(startPos, startLoc);
        node.left = left;
        node.operator = op;
        node.right = right;
        return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
      };
      pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
        var startPos = this.start, startLoc = this.startLoc, expr;
        if (this.isContextual("await") && (this.inAsync || !this.inFunction && this.options.allowAwaitOutsideFunction)) {
          expr = this.parseAwait();
          sawUnary = true;
        } else if (this.type.prefix) {
          var node = this.startNode(), update = this.type === types.incDec;
          node.operator = this.value;
          node.prefix = true;
          this.next();
          node.argument = this.parseMaybeUnary(null, true);
          this.checkExpressionErrors(refDestructuringErrors, true);
          if (update) {
            this.checkLVal(node.argument);
          } else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") {
            this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
          } else {
            sawUnary = true;
          }
          expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        } else {
          expr = this.parseExprSubscripts(refDestructuringErrors);
          if (this.checkExpressionErrors(refDestructuringErrors)) {
            return expr;
          }
          while (this.type.postfix && !this.canInsertSemicolon()) {
            var node$1 = this.startNodeAt(startPos, startLoc);
            node$1.operator = this.value;
            node$1.prefix = false;
            node$1.argument = expr;
            this.checkLVal(expr);
            this.next();
            expr = this.finishNode(node$1, "UpdateExpression");
          }
        }
        if (!sawUnary && this.eat(types.starstar)) {
          return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false);
        } else {
          return expr;
        }
      };
      pp$3.parseExprSubscripts = function(refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseExprAtom(refDestructuringErrors);
        if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
          return expr;
        }
        var result = this.parseSubscripts(expr, startPos, startLoc);
        if (refDestructuringErrors && result.type === "MemberExpression") {
          if (refDestructuringErrors.parenthesizedAssign >= result.start) {
            refDestructuringErrors.parenthesizedAssign = -1;
          }
          if (refDestructuringErrors.parenthesizedBind >= result.start) {
            refDestructuringErrors.parenthesizedBind = -1;
          }
        }
        return result;
      };
      pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
        var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
        var optionalChained = false;
        while (true) {
          var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained);
          if (element.optional) {
            optionalChained = true;
          }
          if (element === base || element.type === "ArrowFunctionExpression") {
            if (optionalChained) {
              var chainNode = this.startNodeAt(startPos, startLoc);
              chainNode.expression = element;
              element = this.finishNode(chainNode, "ChainExpression");
            }
            return element;
          }
          base = element;
        }
      };
      pp$3.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained) {
        var optionalSupported = this.options.ecmaVersion >= 11;
        var optional = optionalSupported && this.eat(types.questionDot);
        if (noCalls && optional) {
          this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
        }
        var computed = this.eat(types.bracketL);
        if (computed || optional && this.type !== types.parenL && this.type !== types.backQuote || this.eat(types.dot)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.object = base;
          node.property = computed ? this.parseExpression() : this.parseIdent(this.options.allowReserved !== "never");
          node.computed = !!computed;
          if (computed) {
            this.expect(types.bracketR);
          }
          if (optionalSupported) {
            node.optional = optional;
          }
          base = this.finishNode(node, "MemberExpression");
        } else if (!noCalls && this.eat(types.parenL)) {
          var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
          this.yieldPos = 0;
          this.awaitPos = 0;
          this.awaitIdentPos = 0;
          var exprList = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
          if (maybeAsyncArrow && !optional && !this.canInsertSemicolon() && this.eat(types.arrow)) {
            this.checkPatternErrors(refDestructuringErrors, false);
            this.checkYieldAwaitInDefaultParams();
            if (this.awaitIdentPos > 0) {
              this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
            }
            this.yieldPos = oldYieldPos;
            this.awaitPos = oldAwaitPos;
            this.awaitIdentPos = oldAwaitIdentPos;
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true);
          }
          this.checkExpressionErrors(refDestructuringErrors, true);
          this.yieldPos = oldYieldPos || this.yieldPos;
          this.awaitPos = oldAwaitPos || this.awaitPos;
          this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
          var node$1 = this.startNodeAt(startPos, startLoc);
          node$1.callee = base;
          node$1.arguments = exprList;
          if (optionalSupported) {
            node$1.optional = optional;
          }
          base = this.finishNode(node$1, "CallExpression");
        } else if (this.type === types.backQuote) {
          if (optional || optionalChained) {
            this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
          }
          var node$2 = this.startNodeAt(startPos, startLoc);
          node$2.tag = base;
          node$2.quasi = this.parseTemplate({ isTagged: true });
          base = this.finishNode(node$2, "TaggedTemplateExpression");
        }
        return base;
      };
      pp$3.parseExprAtom = function(refDestructuringErrors) {
        if (this.type === types.slash) {
          this.readRegexp();
        }
        var node, canBeArrow = this.potentialArrowAt === this.start;
        switch (this.type) {
          case types._super:
            if (!this.allowSuper) {
              this.raise(this.start, "'super' keyword outside a method");
            }
            node = this.startNode();
            this.next();
            if (this.type === types.parenL && !this.allowDirectSuper) {
              this.raise(node.start, "super() call outside constructor of a subclass");
            }
            if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL) {
              this.unexpected();
            }
            return this.finishNode(node, "Super");
          case types._this:
            node = this.startNode();
            this.next();
            return this.finishNode(node, "ThisExpression");
          case types.name:
            var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
            var id = this.parseIdent(false);
            if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function)) {
              return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true);
            }
            if (canBeArrow && !this.canInsertSemicolon()) {
              if (this.eat(types.arrow)) {
                return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false);
              }
              if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
                id = this.parseIdent(false);
                if (this.canInsertSemicolon() || !this.eat(types.arrow)) {
                  this.unexpected();
                }
                return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true);
              }
            }
            return id;
          case types.regexp:
            var value = this.value;
            node = this.parseLiteral(value.value);
            node.regex = { pattern: value.pattern, flags: value.flags };
            return node;
          case types.num:
          case types.string:
            return this.parseLiteral(this.value);
          case types._null:
          case types._true:
          case types._false:
            node = this.startNode();
            node.value = this.type === types._null ? null : this.type === types._true;
            node.raw = this.type.keyword;
            this.next();
            return this.finishNode(node, "Literal");
          case types.parenL:
            var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
            if (refDestructuringErrors) {
              if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
                refDestructuringErrors.parenthesizedAssign = start;
              }
              if (refDestructuringErrors.parenthesizedBind < 0) {
                refDestructuringErrors.parenthesizedBind = start;
              }
            }
            return expr;
          case types.bracketL:
            node = this.startNode();
            this.next();
            node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
            return this.finishNode(node, "ArrayExpression");
          case types.braceL:
            return this.parseObj(false, refDestructuringErrors);
          case types._function:
            node = this.startNode();
            this.next();
            return this.parseFunction(node, 0);
          case types._class:
            return this.parseClass(this.startNode(), false);
          case types._new:
            return this.parseNew();
          case types.backQuote:
            return this.parseTemplate();
          case types._import:
            if (this.options.ecmaVersion >= 11) {
              return this.parseExprImport();
            } else {
              return this.unexpected();
            }
          default:
            this.unexpected();
        }
      };
      pp$3.parseExprImport = function() {
        var node = this.startNode();
        if (this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword import");
        }
        var meta = this.parseIdent(true);
        switch (this.type) {
          case types.parenL:
            return this.parseDynamicImport(node);
          case types.dot:
            node.meta = meta;
            return this.parseImportMeta(node);
          default:
            this.unexpected();
        }
      };
      pp$3.parseDynamicImport = function(node) {
        this.next();
        node.source = this.parseMaybeAssign();
        if (!this.eat(types.parenR)) {
          var errorPos = this.start;
          if (this.eat(types.comma) && this.eat(types.parenR)) {
            this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
          } else {
            this.unexpected(errorPos);
          }
        }
        return this.finishNode(node, "ImportExpression");
      };
      pp$3.parseImportMeta = function(node) {
        this.next();
        var containsEsc = this.containsEsc;
        node.property = this.parseIdent(true);
        if (node.property.name !== "meta") {
          this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
        }
        if (containsEsc) {
          this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
        }
        if (this.options.sourceType !== "module") {
          this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
        }
        return this.finishNode(node, "MetaProperty");
      };
      pp$3.parseLiteral = function(value) {
        var node = this.startNode();
        node.value = value;
        node.raw = this.input.slice(this.start, this.end);
        if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
          node.bigint = node.raw.slice(0, -1).replace(/_/g, "");
        }
        this.next();
        return this.finishNode(node, "Literal");
      };
      pp$3.parseParenExpression = function() {
        this.expect(types.parenL);
        var val = this.parseExpression();
        this.expect(types.parenR);
        return val;
      };
      pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
        var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
        if (this.options.ecmaVersion >= 6) {
          this.next();
          var innerStartPos = this.start, innerStartLoc = this.startLoc;
          var exprList = [], first = true, lastIsComma = false;
          var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
          this.yieldPos = 0;
          this.awaitPos = 0;
          while (this.type !== types.parenR) {
            first ? first = false : this.expect(types.comma);
            if (allowTrailingComma && this.afterTrailingComma(types.parenR, true)) {
              lastIsComma = true;
              break;
            } else if (this.type === types.ellipsis) {
              spreadStart = this.start;
              exprList.push(this.parseParenItem(this.parseRestBinding()));
              if (this.type === types.comma) {
                this.raise(this.start, "Comma is not permitted after the rest element");
              }
              break;
            } else {
              exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
            }
          }
          var innerEndPos = this.start, innerEndLoc = this.startLoc;
          this.expect(types.parenR);
          if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
            this.checkPatternErrors(refDestructuringErrors, false);
            this.checkYieldAwaitInDefaultParams();
            this.yieldPos = oldYieldPos;
            this.awaitPos = oldAwaitPos;
            return this.parseParenArrowList(startPos, startLoc, exprList);
          }
          if (!exprList.length || lastIsComma) {
            this.unexpected(this.lastTokStart);
          }
          if (spreadStart) {
            this.unexpected(spreadStart);
          }
          this.checkExpressionErrors(refDestructuringErrors, true);
          this.yieldPos = oldYieldPos || this.yieldPos;
          this.awaitPos = oldAwaitPos || this.awaitPos;
          if (exprList.length > 1) {
            val = this.startNodeAt(innerStartPos, innerStartLoc);
            val.expressions = exprList;
            this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
          } else {
            val = exprList[0];
          }
        } else {
          val = this.parseParenExpression();
        }
        if (this.options.preserveParens) {
          var par = this.startNodeAt(startPos, startLoc);
          par.expression = val;
          return this.finishNode(par, "ParenthesizedExpression");
        } else {
          return val;
        }
      };
      pp$3.parseParenItem = function(item) {
        return item;
      };
      pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
      };
      var empty$1 = [];
      pp$3.parseNew = function() {
        if (this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword new");
        }
        var node = this.startNode();
        var meta = this.parseIdent(true);
        if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
          node.meta = meta;
          var containsEsc = this.containsEsc;
          node.property = this.parseIdent(true);
          if (node.property.name !== "target") {
            this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
          }
          if (containsEsc) {
            this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
          }
          if (!this.inNonArrowFunction()) {
            this.raiseRecoverable(node.start, "'new.target' can only be used in functions");
          }
          return this.finishNode(node, "MetaProperty");
        }
        var startPos = this.start, startLoc = this.startLoc, isImport = this.type === types._import;
        node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
        if (isImport && node.callee.type === "ImportExpression") {
          this.raise(startPos, "Cannot use new with import()");
        }
        if (this.eat(types.parenL)) {
          node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false);
        } else {
          node.arguments = empty$1;
        }
        return this.finishNode(node, "NewExpression");
      };
      pp$3.parseTemplateElement = function(ref2) {
        var isTagged = ref2.isTagged;
        var elem = this.startNode();
        if (this.type === types.invalidTemplate) {
          if (!isTagged) {
            this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
          }
          elem.value = {
            raw: this.value,
            cooked: null
          };
        } else {
          elem.value = {
            raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
            cooked: this.value
          };
        }
        this.next();
        elem.tail = this.type === types.backQuote;
        return this.finishNode(elem, "TemplateElement");
      };
      pp$3.parseTemplate = function(ref2) {
        if (ref2 === void 0) ref2 = {};
        var isTagged = ref2.isTagged;
        if (isTagged === void 0) isTagged = false;
        var node = this.startNode();
        this.next();
        node.expressions = [];
        var curElt = this.parseTemplateElement({ isTagged });
        node.quasis = [curElt];
        while (!curElt.tail) {
          if (this.type === types.eof) {
            this.raise(this.pos, "Unterminated template literal");
          }
          this.expect(types.dollarBraceL);
          node.expressions.push(this.parseExpression());
          this.expect(types.braceR);
          node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
        }
        this.next();
        return this.finishNode(node, "TemplateLiteral");
      };
      pp$3.isAsyncProp = function(prop) {
        return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      };
      pp$3.parseObj = function(isPattern, refDestructuringErrors) {
        var node = this.startNode(), first = true, propHash = {};
        node.properties = [];
        this.next();
        while (!this.eat(types.braceR)) {
          if (!first) {
            this.expect(types.comma);
            if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          var prop = this.parseProperty(isPattern, refDestructuringErrors);
          if (!isPattern) {
            this.checkPropClash(prop, propHash, refDestructuringErrors);
          }
          node.properties.push(prop);
        }
        return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
      };
      pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
        var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
        if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
          if (isPattern) {
            prop.argument = this.parseIdent(false);
            if (this.type === types.comma) {
              this.raise(this.start, "Comma is not permitted after the rest element");
            }
            return this.finishNode(prop, "RestElement");
          }
          if (this.type === types.parenL && refDestructuringErrors) {
            if (refDestructuringErrors.parenthesizedAssign < 0) {
              refDestructuringErrors.parenthesizedAssign = this.start;
            }
            if (refDestructuringErrors.parenthesizedBind < 0) {
              refDestructuringErrors.parenthesizedBind = this.start;
            }
          }
          prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
          if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
            refDestructuringErrors.trailingComma = this.start;
          }
          return this.finishNode(prop, "SpreadElement");
        }
        if (this.options.ecmaVersion >= 6) {
          prop.method = false;
          prop.shorthand = false;
          if (isPattern || refDestructuringErrors) {
            startPos = this.start;
            startLoc = this.startLoc;
          }
          if (!isPattern) {
            isGenerator = this.eat(types.star);
          }
        }
        var containsEsc = this.containsEsc;
        this.parsePropertyName(prop);
        if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
          isAsync = true;
          isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
          this.parsePropertyName(prop, refDestructuringErrors);
        } else {
          isAsync = false;
        }
        this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
        return this.finishNode(prop, "Property");
      };
      pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
        if ((isGenerator || isAsync) && this.type === types.colon) {
          this.unexpected();
        }
        if (this.eat(types.colon)) {
          prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
          prop.kind = "init";
        } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
          if (isPattern) {
            this.unexpected();
          }
          prop.kind = "init";
          prop.method = true;
          prop.value = this.parseMethod(isGenerator, isAsync);
        } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types.comma && this.type !== types.braceR && this.type !== types.eq)) {
          if (isGenerator || isAsync) {
            this.unexpected();
          }
          prop.kind = prop.key.name;
          this.parsePropertyName(prop);
          prop.value = this.parseMethod(false);
          var paramCount = prop.kind === "get" ? 0 : 1;
          if (prop.value.params.length !== paramCount) {
            var start = prop.value.start;
            if (prop.kind === "get") {
              this.raiseRecoverable(start, "getter should have no params");
            } else {
              this.raiseRecoverable(start, "setter should have exactly one param");
            }
          } else {
            if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
              this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
            }
          }
        } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
          if (isGenerator || isAsync) {
            this.unexpected();
          }
          this.checkUnreserved(prop.key);
          if (prop.key.name === "await" && !this.awaitIdentPos) {
            this.awaitIdentPos = startPos;
          }
          prop.kind = "init";
          if (isPattern) {
            prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
          } else if (this.type === types.eq && refDestructuringErrors) {
            if (refDestructuringErrors.shorthandAssign < 0) {
              refDestructuringErrors.shorthandAssign = this.start;
            }
            prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
          } else {
            prop.value = prop.key;
          }
          prop.shorthand = true;
        } else {
          this.unexpected();
        }
      };
      pp$3.parsePropertyName = function(prop) {
        if (this.options.ecmaVersion >= 6) {
          if (this.eat(types.bracketL)) {
            prop.computed = true;
            prop.key = this.parseMaybeAssign();
            this.expect(types.bracketR);
            return prop.key;
          } else {
            prop.computed = false;
          }
        }
        return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
      };
      pp$3.initFunction = function(node) {
        node.id = null;
        if (this.options.ecmaVersion >= 6) {
          node.generator = node.expression = false;
        }
        if (this.options.ecmaVersion >= 8) {
          node.async = false;
        }
      };
      pp$3.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
        var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.initFunction(node);
        if (this.options.ecmaVersion >= 6) {
          node.generator = isGenerator;
        }
        if (this.options.ecmaVersion >= 8) {
          node.async = !!isAsync;
        }
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
        this.expect(types.parenL);
        node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
        this.checkYieldAwaitInDefaultParams();
        this.parseFunctionBody(node, false, true);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, "FunctionExpression");
      };
      pp$3.parseArrowExpression = function(node, params, isAsync) {
        var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
        this.initFunction(node);
        if (this.options.ecmaVersion >= 8) {
          node.async = !!isAsync;
        }
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        node.params = this.toAssignableList(params, true);
        this.parseFunctionBody(node, true, false);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, "ArrowFunctionExpression");
      };
      pp$3.parseFunctionBody = function(node, isArrowFunction, isMethod) {
        var isExpression = isArrowFunction && this.type !== types.braceL;
        var oldStrict = this.strict, useStrict = false;
        if (isExpression) {
          node.body = this.parseMaybeAssign();
          node.expression = true;
          this.checkParams(node, false);
        } else {
          var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
          if (!oldStrict || nonSimple) {
            useStrict = this.strictDirective(this.end);
            if (useStrict && nonSimple) {
              this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
            }
          }
          var oldLabels = this.labels;
          this.labels = [];
          if (useStrict) {
            this.strict = true;
          }
          this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
          if (this.strict && node.id) {
            this.checkLVal(node.id, BIND_OUTSIDE);
          }
          node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
          node.expression = false;
          this.adaptDirectivePrologue(node.body.body);
          this.labels = oldLabels;
        }
        this.exitScope();
      };
      pp$3.isSimpleParamList = function(params) {
        for (var i = 0, list2 = params; i < list2.length; i += 1) {
          var param = list2[i];
          if (param.type !== "Identifier") {
            return false;
          }
        }
        return true;
      };
      pp$3.checkParams = function(node, allowDuplicates) {
        var nameHash = {};
        for (var i = 0, list2 = node.params; i < list2.length; i += 1) {
          var param = list2[i];
          this.checkLVal(param, BIND_VAR, allowDuplicates ? null : nameHash);
        }
      };
      pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
        var elts = [], first = true;
        while (!this.eat(close)) {
          if (!first) {
            this.expect(types.comma);
            if (allowTrailingComma && this.afterTrailingComma(close)) {
              break;
            }
          } else {
            first = false;
          }
          var elt = void 0;
          if (allowEmpty && this.type === types.comma) {
            elt = null;
          } else if (this.type === types.ellipsis) {
            elt = this.parseSpread(refDestructuringErrors);
            if (refDestructuringErrors && this.type === types.comma && refDestructuringErrors.trailingComma < 0) {
              refDestructuringErrors.trailingComma = this.start;
            }
          } else {
            elt = this.parseMaybeAssign(false, refDestructuringErrors);
          }
          elts.push(elt);
        }
        return elts;
      };
      pp$3.checkUnreserved = function(ref2) {
        var start = ref2.start;
        var end = ref2.end;
        var name = ref2.name;
        if (this.inGenerator && name === "yield") {
          this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
        }
        if (this.inAsync && name === "await") {
          this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
        }
        if (this.keywords.test(name)) {
          this.raise(start, "Unexpected keyword '" + name + "'");
        }
        if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
          return;
        }
        var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
        if (re.test(name)) {
          if (!this.inAsync && name === "await") {
            this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
          }
          this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
        }
      };
      pp$3.parseIdent = function(liberal, isBinding) {
        var node = this.startNode();
        if (this.type === types.name) {
          node.name = this.value;
        } else if (this.type.keyword) {
          node.name = this.type.keyword;
          if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
            this.context.pop();
          }
        } else {
          this.unexpected();
        }
        this.next(!!liberal);
        this.finishNode(node, "Identifier");
        if (!liberal) {
          this.checkUnreserved(node);
          if (node.name === "await" && !this.awaitIdentPos) {
            this.awaitIdentPos = node.start;
          }
        }
        return node;
      };
      pp$3.parseYield = function(noIn) {
        if (!this.yieldPos) {
          this.yieldPos = this.start;
        }
        var node = this.startNode();
        this.next();
        if (this.type === types.semi || this.canInsertSemicolon() || this.type !== types.star && !this.type.startsExpr) {
          node.delegate = false;
          node.argument = null;
        } else {
          node.delegate = this.eat(types.star);
          node.argument = this.parseMaybeAssign(noIn);
        }
        return this.finishNode(node, "YieldExpression");
      };
      pp$3.parseAwait = function() {
        if (!this.awaitPos) {
          this.awaitPos = this.start;
        }
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeUnary(null, false);
        return this.finishNode(node, "AwaitExpression");
      };
      var pp$4 = Parser.prototype;
      pp$4.raise = function(pos, message) {
        var loc = getLineInfo(this.input, pos);
        message += " (" + loc.line + ":" + loc.column + ")";
        var err = new SyntaxError(message);
        err.pos = pos;
        err.loc = loc;
        err.raisedAt = this.pos;
        throw err;
      };
      pp$4.raiseRecoverable = pp$4.raise;
      pp$4.curPosition = function() {
        if (this.options.locations) {
          return new Position(this.curLine, this.pos - this.lineStart);
        }
      };
      var pp$5 = Parser.prototype;
      var Scope = function Scope2(flags) {
        this.flags = flags;
        this.var = [];
        this.lexical = [];
        this.functions = [];
      };
      pp$5.enterScope = function(flags) {
        this.scopeStack.push(new Scope(flags));
      };
      pp$5.exitScope = function() {
        this.scopeStack.pop();
      };
      pp$5.treatFunctionsAsVarInScope = function(scope) {
        return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
      };
      pp$5.declareName = function(name, bindingType, pos) {
        var redeclared = false;
        if (bindingType === BIND_LEXICAL) {
          var scope = this.currentScope();
          redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
          scope.lexical.push(name);
          if (this.inModule && scope.flags & SCOPE_TOP) {
            delete this.undefinedExports[name];
          }
        } else if (bindingType === BIND_SIMPLE_CATCH) {
          var scope$1 = this.currentScope();
          scope$1.lexical.push(name);
        } else if (bindingType === BIND_FUNCTION) {
          var scope$2 = this.currentScope();
          if (this.treatFunctionsAsVar) {
            redeclared = scope$2.lexical.indexOf(name) > -1;
          } else {
            redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
          }
          scope$2.functions.push(name);
        } else {
          for (var i = this.scopeStack.length - 1; i >= 0; --i) {
            var scope$3 = this.scopeStack[i];
            if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
              redeclared = true;
              break;
            }
            scope$3.var.push(name);
            if (this.inModule && scope$3.flags & SCOPE_TOP) {
              delete this.undefinedExports[name];
            }
            if (scope$3.flags & SCOPE_VAR) {
              break;
            }
          }
        }
        if (redeclared) {
          this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
        }
      };
      pp$5.checkLocalExport = function(id) {
        if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
          this.undefinedExports[id.name] = id;
        }
      };
      pp$5.currentScope = function() {
        return this.scopeStack[this.scopeStack.length - 1];
      };
      pp$5.currentVarScope = function() {
        for (var i = this.scopeStack.length - 1; ; i--) {
          var scope = this.scopeStack[i];
          if (scope.flags & SCOPE_VAR) {
            return scope;
          }
        }
      };
      pp$5.currentThisScope = function() {
        for (var i = this.scopeStack.length - 1; ; i--) {
          var scope = this.scopeStack[i];
          if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) {
            return scope;
          }
        }
      };
      var Node = function Node2(parser2, pos, loc) {
        this.type = "";
        this.start = pos;
        this.end = 0;
        if (parser2.options.locations) {
          this.loc = new SourceLocation(parser2, loc);
        }
        if (parser2.options.directSourceFile) {
          this.sourceFile = parser2.options.directSourceFile;
        }
        if (parser2.options.ranges) {
          this.range = [pos, 0];
        }
      };
      var pp$6 = Parser.prototype;
      pp$6.startNode = function() {
        return new Node(this, this.start, this.startLoc);
      };
      pp$6.startNodeAt = function(pos, loc) {
        return new Node(this, pos, loc);
      };
      function finishNodeAt(node, type, pos, loc) {
        node.type = type;
        node.end = pos;
        if (this.options.locations) {
          node.loc.end = loc;
        }
        if (this.options.ranges) {
          node.range[1] = pos;
        }
        return node;
      }
      pp$6.finishNode = function(node, type) {
        return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
      };
      pp$6.finishNodeAt = function(node, type, pos, loc) {
        return finishNodeAt.call(this, node, type, pos, loc);
      };
      var TokContext = function TokContext2(token3, isExpr, preserveSpace, override, generator) {
        this.token = token3;
        this.isExpr = !!isExpr;
        this.preserveSpace = !!preserveSpace;
        this.override = override;
        this.generator = !!generator;
      };
      var types$1 = {
        b_stat: new TokContext("{", false),
        b_expr: new TokContext("{", true),
        b_tmpl: new TokContext("${", false),
        p_stat: new TokContext("(", false),
        p_expr: new TokContext("(", true),
        q_tmpl: new TokContext("`", true, true, function(p) {
          return p.tryReadTemplateToken();
        }),
        f_stat: new TokContext("function", false),
        f_expr: new TokContext("function", true),
        f_expr_gen: new TokContext("function", true, false, null, true),
        f_gen: new TokContext("function", false, false, null, true)
      };
      var pp$7 = Parser.prototype;
      pp$7.initialContext = function() {
        return [types$1.b_stat];
      };
      pp$7.braceIsBlock = function(prevType) {
        var parent = this.curContext();
        if (parent === types$1.f_expr || parent === types$1.f_stat) {
          return true;
        }
        if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr)) {
          return !parent.isExpr;
        }
        if (prevType === types._return || prevType === types.name && this.exprAllowed) {
          return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
        }
        if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType === types.arrow) {
          return true;
        }
        if (prevType === types.braceL) {
          return parent === types$1.b_stat;
        }
        if (prevType === types._var || prevType === types._const || prevType === types.name) {
          return false;
        }
        return !this.exprAllowed;
      };
      pp$7.inGeneratorContext = function() {
        for (var i = this.context.length - 1; i >= 1; i--) {
          var context = this.context[i];
          if (context.token === "function") {
            return context.generator;
          }
        }
        return false;
      };
      pp$7.updateContext = function(prevType) {
        var update, type = this.type;
        if (type.keyword && prevType === types.dot) {
          this.exprAllowed = false;
        } else if (update = type.updateContext) {
          update.call(this, prevType);
        } else {
          this.exprAllowed = type.beforeExpr;
        }
      };
      types.parenR.updateContext = types.braceR.updateContext = function() {
        if (this.context.length === 1) {
          this.exprAllowed = true;
          return;
        }
        var out = this.context.pop();
        if (out === types$1.b_stat && this.curContext().token === "function") {
          out = this.context.pop();
        }
        this.exprAllowed = !out.isExpr;
      };
      types.braceL.updateContext = function(prevType) {
        this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
        this.exprAllowed = true;
      };
      types.dollarBraceL.updateContext = function() {
        this.context.push(types$1.b_tmpl);
        this.exprAllowed = true;
      };
      types.parenL.updateContext = function(prevType) {
        var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
        this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
        this.exprAllowed = true;
      };
      types.incDec.updateContext = function() {
      };
      types._function.updateContext = types._class.updateContext = function(prevType) {
        if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else && !(prevType === types._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat)) {
          this.context.push(types$1.f_expr);
        } else {
          this.context.push(types$1.f_stat);
        }
        this.exprAllowed = false;
      };
      types.backQuote.updateContext = function() {
        if (this.curContext() === types$1.q_tmpl) {
          this.context.pop();
        } else {
          this.context.push(types$1.q_tmpl);
        }
        this.exprAllowed = false;
      };
      types.star.updateContext = function(prevType) {
        if (prevType === types._function) {
          var index = this.context.length - 1;
          if (this.context[index] === types$1.f_expr) {
            this.context[index] = types$1.f_expr_gen;
          } else {
            this.context[index] = types$1.f_gen;
          }
        }
        this.exprAllowed = true;
      };
      types.name.updateContext = function(prevType) {
        var allowed = false;
        if (this.options.ecmaVersion >= 6 && prevType !== types.dot) {
          if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
            allowed = true;
          }
        }
        this.exprAllowed = allowed;
      };
      var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
      var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
      var ecma11BinaryProperties = ecma10BinaryProperties;
      var unicodeBinaryProperties = {
        9: ecma9BinaryProperties,
        10: ecma10BinaryProperties,
        11: ecma11BinaryProperties
      };
      var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
      var ecma9ScriptValues = "Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
      var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
      var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
      var unicodeScriptValues = {
        9: ecma9ScriptValues,
        10: ecma10ScriptValues,
        11: ecma11ScriptValues
      };
      var data = {};
      function buildUnicodeData(ecmaVersion) {
        var d = data[ecmaVersion] = {
          binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
          nonBinary: {
            General_Category: wordsRegexp(unicodeGeneralCategoryValues),
            Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
          }
        };
        d.nonBinary.Script_Extensions = d.nonBinary.Script;
        d.nonBinary.gc = d.nonBinary.General_Category;
        d.nonBinary.sc = d.nonBinary.Script;
        d.nonBinary.scx = d.nonBinary.Script_Extensions;
      }
      buildUnicodeData(9);
      buildUnicodeData(10);
      buildUnicodeData(11);
      var pp$8 = Parser.prototype;
      var RegExpValidationState = function RegExpValidationState2(parser2) {
        this.parser = parser2;
        this.validFlags = "gim" + (parser2.options.ecmaVersion >= 6 ? "uy" : "") + (parser2.options.ecmaVersion >= 9 ? "s" : "");
        this.unicodeProperties = data[parser2.options.ecmaVersion >= 11 ? 11 : parser2.options.ecmaVersion];
        this.source = "";
        this.flags = "";
        this.start = 0;
        this.switchU = false;
        this.switchN = false;
        this.pos = 0;
        this.lastIntValue = 0;
        this.lastStringValue = "";
        this.lastAssertionIsQuantifiable = false;
        this.numCapturingParens = 0;
        this.maxBackReference = 0;
        this.groupNames = [];
        this.backReferenceNames = [];
      };
      RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
        var unicode = flags.indexOf("u") !== -1;
        this.start = start | 0;
        this.source = pattern + "";
        this.flags = flags;
        this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
        this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
      };
      RegExpValidationState.prototype.raise = function raise(message) {
        this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
      };
      RegExpValidationState.prototype.at = function at(i, forceU) {
        if (forceU === void 0) forceU = false;
        var s = this.source;
        var l = s.length;
        if (i >= l) {
          return -1;
        }
        var c = s.charCodeAt(i);
        if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l) {
          return c;
        }
        var next = s.charCodeAt(i + 1);
        return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
      };
      RegExpValidationState.prototype.nextIndex = function nextIndex(i, forceU) {
        if (forceU === void 0) forceU = false;
        var s = this.source;
        var l = s.length;
        if (i >= l) {
          return l;
        }
        var c = s.charCodeAt(i), next;
        if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 56320 || next > 57343) {
          return i + 1;
        }
        return i + 2;
      };
      RegExpValidationState.prototype.current = function current(forceU) {
        if (forceU === void 0) forceU = false;
        return this.at(this.pos, forceU);
      };
      RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
        if (forceU === void 0) forceU = false;
        return this.at(this.nextIndex(this.pos, forceU), forceU);
      };
      RegExpValidationState.prototype.advance = function advance(forceU) {
        if (forceU === void 0) forceU = false;
        this.pos = this.nextIndex(this.pos, forceU);
      };
      RegExpValidationState.prototype.eat = function eat(ch, forceU) {
        if (forceU === void 0) forceU = false;
        if (this.current(forceU) === ch) {
          this.advance(forceU);
          return true;
        }
        return false;
      };
      function codePointToString(ch) {
        if (ch <= 65535) {
          return String.fromCharCode(ch);
        }
        ch -= 65536;
        return String.fromCharCode((ch >> 10) + 55296, (ch & 1023) + 56320);
      }
      pp$8.validateRegExpFlags = function(state) {
        var validFlags = state.validFlags;
        var flags = state.flags;
        for (var i = 0; i < flags.length; i++) {
          var flag = flags.charAt(i);
          if (validFlags.indexOf(flag) === -1) {
            this.raise(state.start, "Invalid regular expression flag");
          }
          if (flags.indexOf(flag, i + 1) > -1) {
            this.raise(state.start, "Duplicate regular expression flag");
          }
        }
      };
      pp$8.validateRegExpPattern = function(state) {
        this.regexp_pattern(state);
        if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
          state.switchN = true;
          this.regexp_pattern(state);
        }
      };
      pp$8.regexp_pattern = function(state) {
        state.pos = 0;
        state.lastIntValue = 0;
        state.lastStringValue = "";
        state.lastAssertionIsQuantifiable = false;
        state.numCapturingParens = 0;
        state.maxBackReference = 0;
        state.groupNames.length = 0;
        state.backReferenceNames.length = 0;
        this.regexp_disjunction(state);
        if (state.pos !== state.source.length) {
          if (state.eat(
            41
            /* ) */
          )) {
            state.raise("Unmatched ')'");
          }
          if (state.eat(
            93
            /* ] */
          ) || state.eat(
            125
            /* } */
          )) {
            state.raise("Lone quantifier brackets");
          }
        }
        if (state.maxBackReference > state.numCapturingParens) {
          state.raise("Invalid escape");
        }
        for (var i = 0, list2 = state.backReferenceNames; i < list2.length; i += 1) {
          var name = list2[i];
          if (state.groupNames.indexOf(name) === -1) {
            state.raise("Invalid named capture referenced");
          }
        }
      };
      pp$8.regexp_disjunction = function(state) {
        this.regexp_alternative(state);
        while (state.eat(
          124
          /* | */
        )) {
          this.regexp_alternative(state);
        }
        if (this.regexp_eatQuantifier(state, true)) {
          state.raise("Nothing to repeat");
        }
        if (state.eat(
          123
          /* { */
        )) {
          state.raise("Lone quantifier brackets");
        }
      };
      pp$8.regexp_alternative = function(state) {
        while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
        }
      };
      pp$8.regexp_eatTerm = function(state) {
        if (this.regexp_eatAssertion(state)) {
          if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
            if (state.switchU) {
              state.raise("Invalid quantifier");
            }
          }
          return true;
        }
        if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
          this.regexp_eatQuantifier(state);
          return true;
        }
        return false;
      };
      pp$8.regexp_eatAssertion = function(state) {
        var start = state.pos;
        state.lastAssertionIsQuantifiable = false;
        if (state.eat(
          94
          /* ^ */
        ) || state.eat(
          36
          /* $ */
        )) {
          return true;
        }
        if (state.eat(
          92
          /* \ */
        )) {
          if (state.eat(
            66
            /* B */
          ) || state.eat(
            98
            /* b */
          )) {
            return true;
          }
          state.pos = start;
        }
        if (state.eat(
          40
          /* ( */
        ) && state.eat(
          63
          /* ? */
        )) {
          var lookbehind = false;
          if (this.options.ecmaVersion >= 9) {
            lookbehind = state.eat(
              60
              /* < */
            );
          }
          if (state.eat(
            61
            /* = */
          ) || state.eat(
            33
            /* ! */
          )) {
            this.regexp_disjunction(state);
            if (!state.eat(
              41
              /* ) */
            )) {
              state.raise("Unterminated group");
            }
            state.lastAssertionIsQuantifiable = !lookbehind;
            return true;
          }
        }
        state.pos = start;
        return false;
      };
      pp$8.regexp_eatQuantifier = function(state, noError) {
        if (noError === void 0) noError = false;
        if (this.regexp_eatQuantifierPrefix(state, noError)) {
          state.eat(
            63
            /* ? */
          );
          return true;
        }
        return false;
      };
      pp$8.regexp_eatQuantifierPrefix = function(state, noError) {
        return state.eat(
          42
          /* * */
        ) || state.eat(
          43
          /* + */
        ) || state.eat(
          63
          /* ? */
        ) || this.regexp_eatBracedQuantifier(state, noError);
      };
      pp$8.regexp_eatBracedQuantifier = function(state, noError) {
        var start = state.pos;
        if (state.eat(
          123
          /* { */
        )) {
          var min = 0, max = -1;
          if (this.regexp_eatDecimalDigits(state)) {
            min = state.lastIntValue;
            if (state.eat(
              44
              /* , */
            ) && this.regexp_eatDecimalDigits(state)) {
              max = state.lastIntValue;
            }
            if (state.eat(
              125
              /* } */
            )) {
              if (max !== -1 && max < min && !noError) {
                state.raise("numbers out of order in {} quantifier");
              }
              return true;
            }
          }
          if (state.switchU && !noError) {
            state.raise("Incomplete quantifier");
          }
          state.pos = start;
        }
        return false;
      };
      pp$8.regexp_eatAtom = function(state) {
        return this.regexp_eatPatternCharacters(state) || state.eat(
          46
          /* . */
        ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
      };
      pp$8.regexp_eatReverseSolidusAtomEscape = function(state) {
        var start = state.pos;
        if (state.eat(
          92
          /* \ */
        )) {
          if (this.regexp_eatAtomEscape(state)) {
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$8.regexp_eatUncapturingGroup = function(state) {
        var start = state.pos;
        if (state.eat(
          40
          /* ( */
        )) {
          if (state.eat(
            63
            /* ? */
          ) && state.eat(
            58
            /* : */
          )) {
            this.regexp_disjunction(state);
            if (state.eat(
              41
              /* ) */
            )) {
              return true;
            }
            state.raise("Unterminated group");
          }
          state.pos = start;
        }
        return false;
      };
      pp$8.regexp_eatCapturingGroup = function(state) {
        if (state.eat(
          40
          /* ( */
        )) {
          if (this.options.ecmaVersion >= 9) {
            this.regexp_groupSpecifier(state);
          } else if (state.current() === 63) {
            state.raise("Invalid group");
          }
          this.regexp_disjunction(state);
          if (state.eat(
            41
            /* ) */
          )) {
            state.numCapturingParens += 1;
            return true;
          }
          state.raise("Unterminated group");
        }
        return false;
      };
      pp$8.regexp_eatExtendedAtom = function(state) {
        return state.eat(
          46
          /* . */
        ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
      };
      pp$8.regexp_eatInvalidBracedQuantifier = function(state) {
        if (this.regexp_eatBracedQuantifier(state, true)) {
          state.raise("Nothing to repeat");
        }
        return false;
      };
      pp$8.regexp_eatSyntaxCharacter = function(state) {
        var ch = state.current();
        if (isSyntaxCharacter(ch)) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      function isSyntaxCharacter(ch) {
        return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
      }
      pp$8.regexp_eatPatternCharacters = function(state) {
        var start = state.pos;
        var ch = 0;
        while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
          state.advance();
        }
        return state.pos !== start;
      };
      pp$8.regexp_eatExtendedPatternCharacter = function(state) {
        var ch = state.current();
        if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
          state.advance();
          return true;
        }
        return false;
      };
      pp$8.regexp_groupSpecifier = function(state) {
        if (state.eat(
          63
          /* ? */
        )) {
          if (this.regexp_eatGroupName(state)) {
            if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
              state.raise("Duplicate capture group name");
            }
            state.groupNames.push(state.lastStringValue);
            return;
          }
          state.raise("Invalid group");
        }
      };
      pp$8.regexp_eatGroupName = function(state) {
        state.lastStringValue = "";
        if (state.eat(
          60
          /* < */
        )) {
          if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
            62
            /* > */
          )) {
            return true;
          }
          state.raise("Invalid capture group name");
        }
        return false;
      };
      pp$8.regexp_eatRegExpIdentifierName = function(state) {
        state.lastStringValue = "";
        if (this.regexp_eatRegExpIdentifierStart(state)) {
          state.lastStringValue += codePointToString(state.lastIntValue);
          while (this.regexp_eatRegExpIdentifierPart(state)) {
            state.lastStringValue += codePointToString(state.lastIntValue);
          }
          return true;
        }
        return false;
      };
      pp$8.regexp_eatRegExpIdentifierStart = function(state) {
        var start = state.pos;
        var forceU = this.options.ecmaVersion >= 11;
        var ch = state.current(forceU);
        state.advance(forceU);
        if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
          ch = state.lastIntValue;
        }
        if (isRegExpIdentifierStart(ch)) {
          state.lastIntValue = ch;
          return true;
        }
        state.pos = start;
        return false;
      };
      function isRegExpIdentifierStart(ch) {
        return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
      }
      pp$8.regexp_eatRegExpIdentifierPart = function(state) {
        var start = state.pos;
        var forceU = this.options.ecmaVersion >= 11;
        var ch = state.current(forceU);
        state.advance(forceU);
        if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
          ch = state.lastIntValue;
        }
        if (isRegExpIdentifierPart(ch)) {
          state.lastIntValue = ch;
          return true;
        }
        state.pos = start;
        return false;
      };
      function isRegExpIdentifierPart(ch) {
        return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
      }
      pp$8.regexp_eatAtomEscape = function(state) {
        if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
          return true;
        }
        if (state.switchU) {
          if (state.current() === 99) {
            state.raise("Invalid unicode escape");
          }
          state.raise("Invalid escape");
        }
        return false;
      };
      pp$8.regexp_eatBackReference = function(state) {
        var start = state.pos;
        if (this.regexp_eatDecimalEscape(state)) {
          var n = state.lastIntValue;
          if (state.switchU) {
            if (n > state.maxBackReference) {
              state.maxBackReference = n;
            }
            return true;
          }
          if (n <= state.numCapturingParens) {
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$8.regexp_eatKGroupName = function(state) {
        if (state.eat(
          107
          /* k */
        )) {
          if (this.regexp_eatGroupName(state)) {
            state.backReferenceNames.push(state.lastStringValue);
            return true;
          }
          state.raise("Invalid named reference");
        }
        return false;
      };
      pp$8.regexp_eatCharacterEscape = function(state) {
        return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
      };
      pp$8.regexp_eatCControlLetter = function(state) {
        var start = state.pos;
        if (state.eat(
          99
          /* c */
        )) {
          if (this.regexp_eatControlLetter(state)) {
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$8.regexp_eatZero = function(state) {
        if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
          state.lastIntValue = 0;
          state.advance();
          return true;
        }
        return false;
      };
      pp$8.regexp_eatControlEscape = function(state) {
        var ch = state.current();
        if (ch === 116) {
          state.lastIntValue = 9;
          state.advance();
          return true;
        }
        if (ch === 110) {
          state.lastIntValue = 10;
          state.advance();
          return true;
        }
        if (ch === 118) {
          state.lastIntValue = 11;
          state.advance();
          return true;
        }
        if (ch === 102) {
          state.lastIntValue = 12;
          state.advance();
          return true;
        }
        if (ch === 114) {
          state.lastIntValue = 13;
          state.advance();
          return true;
        }
        return false;
      };
      pp$8.regexp_eatControlLetter = function(state) {
        var ch = state.current();
        if (isControlLetter(ch)) {
          state.lastIntValue = ch % 32;
          state.advance();
          return true;
        }
        return false;
      };
      function isControlLetter(ch) {
        return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
      }
      pp$8.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
        if (forceU === void 0) forceU = false;
        var start = state.pos;
        var switchU = forceU || state.switchU;
        if (state.eat(
          117
          /* u */
        )) {
          if (this.regexp_eatFixedHexDigits(state, 4)) {
            var lead = state.lastIntValue;
            if (switchU && lead >= 55296 && lead <= 56319) {
              var leadSurrogateEnd = state.pos;
              if (state.eat(
                92
                /* \ */
              ) && state.eat(
                117
                /* u */
              ) && this.regexp_eatFixedHexDigits(state, 4)) {
                var trail = state.lastIntValue;
                if (trail >= 56320 && trail <= 57343) {
                  state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
                  return true;
                }
              }
              state.pos = leadSurrogateEnd;
              state.lastIntValue = lead;
            }
            return true;
          }
          if (switchU && state.eat(
            123
            /* { */
          ) && this.regexp_eatHexDigits(state) && state.eat(
            125
            /* } */
          ) && isValidUnicode(state.lastIntValue)) {
            return true;
          }
          if (switchU) {
            state.raise("Invalid unicode escape");
          }
          state.pos = start;
        }
        return false;
      };
      function isValidUnicode(ch) {
        return ch >= 0 && ch <= 1114111;
      }
      pp$8.regexp_eatIdentityEscape = function(state) {
        if (state.switchU) {
          if (this.regexp_eatSyntaxCharacter(state)) {
            return true;
          }
          if (state.eat(
            47
            /* / */
          )) {
            state.lastIntValue = 47;
            return true;
          }
          return false;
        }
        var ch = state.current();
        if (ch !== 99 && (!state.switchN || ch !== 107)) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      pp$8.regexp_eatDecimalEscape = function(state) {
        state.lastIntValue = 0;
        var ch = state.current();
        if (ch >= 49 && ch <= 57) {
          do {
            state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
            state.advance();
          } while ((ch = state.current()) >= 48 && ch <= 57);
          return true;
        }
        return false;
      };
      pp$8.regexp_eatCharacterClassEscape = function(state) {
        var ch = state.current();
        if (isCharacterClassEscape(ch)) {
          state.lastIntValue = -1;
          state.advance();
          return true;
        }
        if (state.switchU && this.options.ecmaVersion >= 9 && (ch === 80 || ch === 112)) {
          state.lastIntValue = -1;
          state.advance();
          if (state.eat(
            123
            /* { */
          ) && this.regexp_eatUnicodePropertyValueExpression(state) && state.eat(
            125
            /* } */
          )) {
            return true;
          }
          state.raise("Invalid property name");
        }
        return false;
      };
      function isCharacterClassEscape(ch) {
        return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
      }
      pp$8.regexp_eatUnicodePropertyValueExpression = function(state) {
        var start = state.pos;
        if (this.regexp_eatUnicodePropertyName(state) && state.eat(
          61
          /* = */
        )) {
          var name = state.lastStringValue;
          if (this.regexp_eatUnicodePropertyValue(state)) {
            var value = state.lastStringValue;
            this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
            return true;
          }
        }
        state.pos = start;
        if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
          var nameOrValue = state.lastStringValue;
          this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
          return true;
        }
        return false;
      };
      pp$8.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
        if (!has(state.unicodeProperties.nonBinary, name)) {
          state.raise("Invalid property name");
        }
        if (!state.unicodeProperties.nonBinary[name].test(value)) {
          state.raise("Invalid property value");
        }
      };
      pp$8.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
        if (!state.unicodeProperties.binary.test(nameOrValue)) {
          state.raise("Invalid property name");
        }
      };
      pp$8.regexp_eatUnicodePropertyName = function(state) {
        var ch = 0;
        state.lastStringValue = "";
        while (isUnicodePropertyNameCharacter(ch = state.current())) {
          state.lastStringValue += codePointToString(ch);
          state.advance();
        }
        return state.lastStringValue !== "";
      };
      function isUnicodePropertyNameCharacter(ch) {
        return isControlLetter(ch) || ch === 95;
      }
      pp$8.regexp_eatUnicodePropertyValue = function(state) {
        var ch = 0;
        state.lastStringValue = "";
        while (isUnicodePropertyValueCharacter(ch = state.current())) {
          state.lastStringValue += codePointToString(ch);
          state.advance();
        }
        return state.lastStringValue !== "";
      };
      function isUnicodePropertyValueCharacter(ch) {
        return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
      }
      pp$8.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
        return this.regexp_eatUnicodePropertyValue(state);
      };
      pp$8.regexp_eatCharacterClass = function(state) {
        if (state.eat(
          91
          /* [ */
        )) {
          state.eat(
            94
            /* ^ */
          );
          this.regexp_classRanges(state);
          if (state.eat(
            93
            /* ] */
          )) {
            return true;
          }
          state.raise("Unterminated character class");
        }
        return false;
      };
      pp$8.regexp_classRanges = function(state) {
        while (this.regexp_eatClassAtom(state)) {
          var left = state.lastIntValue;
          if (state.eat(
            45
            /* - */
          ) && this.regexp_eatClassAtom(state)) {
            var right = state.lastIntValue;
            if (state.switchU && (left === -1 || right === -1)) {
              state.raise("Invalid character class");
            }
            if (left !== -1 && right !== -1 && left > right) {
              state.raise("Range out of order in character class");
            }
          }
        }
      };
      pp$8.regexp_eatClassAtom = function(state) {
        var start = state.pos;
        if (state.eat(
          92
          /* \ */
        )) {
          if (this.regexp_eatClassEscape(state)) {
            return true;
          }
          if (state.switchU) {
            var ch$1 = state.current();
            if (ch$1 === 99 || isOctalDigit(ch$1)) {
              state.raise("Invalid class escape");
            }
            state.raise("Invalid escape");
          }
          state.pos = start;
        }
        var ch = state.current();
        if (ch !== 93) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      pp$8.regexp_eatClassEscape = function(state) {
        var start = state.pos;
        if (state.eat(
          98
          /* b */
        )) {
          state.lastIntValue = 8;
          return true;
        }
        if (state.switchU && state.eat(
          45
          /* - */
        )) {
          state.lastIntValue = 45;
          return true;
        }
        if (!state.switchU && state.eat(
          99
          /* c */
        )) {
          if (this.regexp_eatClassControlLetter(state)) {
            return true;
          }
          state.pos = start;
        }
        return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
      };
      pp$8.regexp_eatClassControlLetter = function(state) {
        var ch = state.current();
        if (isDecimalDigit(ch) || ch === 95) {
          state.lastIntValue = ch % 32;
          state.advance();
          return true;
        }
        return false;
      };
      pp$8.regexp_eatHexEscapeSequence = function(state) {
        var start = state.pos;
        if (state.eat(
          120
          /* x */
        )) {
          if (this.regexp_eatFixedHexDigits(state, 2)) {
            return true;
          }
          if (state.switchU) {
            state.raise("Invalid escape");
          }
          state.pos = start;
        }
        return false;
      };
      pp$8.regexp_eatDecimalDigits = function(state) {
        var start = state.pos;
        var ch = 0;
        state.lastIntValue = 0;
        while (isDecimalDigit(ch = state.current())) {
          state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
          state.advance();
        }
        return state.pos !== start;
      };
      function isDecimalDigit(ch) {
        return ch >= 48 && ch <= 57;
      }
      pp$8.regexp_eatHexDigits = function(state) {
        var start = state.pos;
        var ch = 0;
        state.lastIntValue = 0;
        while (isHexDigit(ch = state.current())) {
          state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
          state.advance();
        }
        return state.pos !== start;
      };
      function isHexDigit(ch) {
        return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
      }
      function hexToInt(ch) {
        if (ch >= 65 && ch <= 70) {
          return 10 + (ch - 65);
        }
        if (ch >= 97 && ch <= 102) {
          return 10 + (ch - 97);
        }
        return ch - 48;
      }
      pp$8.regexp_eatLegacyOctalEscapeSequence = function(state) {
        if (this.regexp_eatOctalDigit(state)) {
          var n1 = state.lastIntValue;
          if (this.regexp_eatOctalDigit(state)) {
            var n2 = state.lastIntValue;
            if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
              state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
            } else {
              state.lastIntValue = n1 * 8 + n2;
            }
          } else {
            state.lastIntValue = n1;
          }
          return true;
        }
        return false;
      };
      pp$8.regexp_eatOctalDigit = function(state) {
        var ch = state.current();
        if (isOctalDigit(ch)) {
          state.lastIntValue = ch - 48;
          state.advance();
          return true;
        }
        state.lastIntValue = 0;
        return false;
      };
      function isOctalDigit(ch) {
        return ch >= 48 && ch <= 55;
      }
      pp$8.regexp_eatFixedHexDigits = function(state, length) {
        var start = state.pos;
        state.lastIntValue = 0;
        for (var i = 0; i < length; ++i) {
          var ch = state.current();
          if (!isHexDigit(ch)) {
            state.pos = start;
            return false;
          }
          state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
          state.advance();
        }
        return true;
      };
      var Token = function Token2(p) {
        this.type = p.type;
        this.value = p.value;
        this.start = p.start;
        this.end = p.end;
        if (p.options.locations) {
          this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
        }
        if (p.options.ranges) {
          this.range = [p.start, p.end];
        }
      };
      var pp$9 = Parser.prototype;
      pp$9.next = function(ignoreEscapeSequenceInKeyword) {
        if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
        }
        if (this.options.onToken) {
          this.options.onToken(new Token(this));
        }
        this.lastTokEnd = this.end;
        this.lastTokStart = this.start;
        this.lastTokEndLoc = this.endLoc;
        this.lastTokStartLoc = this.startLoc;
        this.nextToken();
      };
      pp$9.getToken = function() {
        this.next();
        return new Token(this);
      };
      if (typeof Symbol !== "undefined") {
        pp$9[Symbol.iterator] = function() {
          var this$1 = this;
          return {
            next: function() {
              var token3 = this$1.getToken();
              return {
                done: token3.type === types.eof,
                value: token3
              };
            }
          };
        };
      }
      pp$9.curContext = function() {
        return this.context[this.context.length - 1];
      };
      pp$9.nextToken = function() {
        var curContext = this.curContext();
        if (!curContext || !curContext.preserveSpace) {
          this.skipSpace();
        }
        this.start = this.pos;
        if (this.options.locations) {
          this.startLoc = this.curPosition();
        }
        if (this.pos >= this.input.length) {
          return this.finishToken(types.eof);
        }
        if (curContext.override) {
          return curContext.override(this);
        } else {
          this.readToken(this.fullCharCodeAtPos());
        }
      };
      pp$9.readToken = function(code2) {
        if (isIdentifierStart(code2, this.options.ecmaVersion >= 6) || code2 === 92) {
          return this.readWord();
        }
        return this.getTokenFromCode(code2);
      };
      pp$9.fullCharCodeAtPos = function() {
        var code2 = this.input.charCodeAt(this.pos);
        if (code2 <= 55295 || code2 >= 57344) {
          return code2;
        }
        var next = this.input.charCodeAt(this.pos + 1);
        return (code2 << 10) + next - 56613888;
      };
      pp$9.skipBlockComment = function() {
        var startLoc = this.options.onComment && this.curPosition();
        var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
        if (end === -1) {
          this.raise(this.pos - 2, "Unterminated comment");
        }
        this.pos = end + 2;
        if (this.options.locations) {
          lineBreakG.lastIndex = start;
          var match;
          while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
            ++this.curLine;
            this.lineStart = match.index + match[0].length;
          }
        }
        if (this.options.onComment) {
          this.options.onComment(
            true,
            this.input.slice(start + 2, end),
            start,
            this.pos,
            startLoc,
            this.curPosition()
          );
        }
      };
      pp$9.skipLineComment = function(startSkip) {
        var start = this.pos;
        var startLoc = this.options.onComment && this.curPosition();
        var ch = this.input.charCodeAt(this.pos += startSkip);
        while (this.pos < this.input.length && !isNewLine(ch)) {
          ch = this.input.charCodeAt(++this.pos);
        }
        if (this.options.onComment) {
          this.options.onComment(
            false,
            this.input.slice(start + startSkip, this.pos),
            start,
            this.pos,
            startLoc,
            this.curPosition()
          );
        }
      };
      pp$9.skipSpace = function() {
        loop: while (this.pos < this.input.length) {
          var ch = this.input.charCodeAt(this.pos);
          switch (ch) {
            case 32:
            case 160:
              ++this.pos;
              break;
            case 13:
              if (this.input.charCodeAt(this.pos + 1) === 10) {
                ++this.pos;
              }
            case 10:
            case 8232:
            case 8233:
              ++this.pos;
              if (this.options.locations) {
                ++this.curLine;
                this.lineStart = this.pos;
              }
              break;
            case 47:
              switch (this.input.charCodeAt(this.pos + 1)) {
                case 42:
                  this.skipBlockComment();
                  break;
                case 47:
                  this.skipLineComment(2);
                  break;
                default:
                  break loop;
              }
              break;
            default:
              if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
                ++this.pos;
              } else {
                break loop;
              }
          }
        }
      };
      pp$9.finishToken = function(type, val) {
        this.end = this.pos;
        if (this.options.locations) {
          this.endLoc = this.curPosition();
        }
        var prevType = this.type;
        this.type = type;
        this.value = val;
        this.updateContext(prevType);
      };
      pp$9.readToken_dot = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next >= 48 && next <= 57) {
          return this.readNumber(true);
        }
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
          this.pos += 3;
          return this.finishToken(types.ellipsis);
        } else {
          ++this.pos;
          return this.finishToken(types.dot);
        }
      };
      pp$9.readToken_slash = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (this.exprAllowed) {
          ++this.pos;
          return this.readRegexp();
        }
        if (next === 61) {
          return this.finishOp(types.assign, 2);
        }
        return this.finishOp(types.slash, 1);
      };
      pp$9.readToken_mult_modulo_exp = function(code2) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        var tokentype = code2 === 42 ? types.star : types.modulo;
        if (this.options.ecmaVersion >= 7 && code2 === 42 && next === 42) {
          ++size;
          tokentype = types.starstar;
          next = this.input.charCodeAt(this.pos + 2);
        }
        if (next === 61) {
          return this.finishOp(types.assign, size + 1);
        }
        return this.finishOp(tokentype, size);
      };
      pp$9.readToken_pipe_amp = function(code2) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code2) {
          if (this.options.ecmaVersion >= 12) {
            var next2 = this.input.charCodeAt(this.pos + 2);
            if (next2 === 61) {
              return this.finishOp(types.assign, 3);
            }
          }
          return this.finishOp(code2 === 124 ? types.logicalOR : types.logicalAND, 2);
        }
        if (next === 61) {
          return this.finishOp(types.assign, 2);
        }
        return this.finishOp(code2 === 124 ? types.bitwiseOR : types.bitwiseAND, 1);
      };
      pp$9.readToken_caret = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) {
          return this.finishOp(types.assign, 2);
        }
        return this.finishOp(types.bitwiseXOR, 1);
      };
      pp$9.readToken_plus_min = function(code2) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code2) {
          if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
            this.skipLineComment(3);
            this.skipSpace();
            return this.nextToken();
          }
          return this.finishOp(types.incDec, 2);
        }
        if (next === 61) {
          return this.finishOp(types.assign, 2);
        }
        return this.finishOp(types.plusMin, 1);
      };
      pp$9.readToken_lt_gt = function(code2) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        if (next === code2) {
          size = code2 === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
          if (this.input.charCodeAt(this.pos + size) === 61) {
            return this.finishOp(types.assign, size + 1);
          }
          return this.finishOp(types.bitShift, size);
        }
        if (next === 33 && code2 === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
          this.skipLineComment(4);
          this.skipSpace();
          return this.nextToken();
        }
        if (next === 61) {
          size = 2;
        }
        return this.finishOp(types.relational, size);
      };
      pp$9.readToken_eq_excl = function(code2) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) {
          return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
        }
        if (code2 === 61 && next === 62 && this.options.ecmaVersion >= 6) {
          this.pos += 2;
          return this.finishToken(types.arrow);
        }
        return this.finishOp(code2 === 61 ? types.eq : types.prefix, 1);
      };
      pp$9.readToken_question = function() {
        var ecmaVersion = this.options.ecmaVersion;
        if (ecmaVersion >= 11) {
          var next = this.input.charCodeAt(this.pos + 1);
          if (next === 46) {
            var next2 = this.input.charCodeAt(this.pos + 2);
            if (next2 < 48 || next2 > 57) {
              return this.finishOp(types.questionDot, 2);
            }
          }
          if (next === 63) {
            if (ecmaVersion >= 12) {
              var next2$1 = this.input.charCodeAt(this.pos + 2);
              if (next2$1 === 61) {
                return this.finishOp(types.assign, 3);
              }
            }
            return this.finishOp(types.coalesce, 2);
          }
        }
        return this.finishOp(types.question, 1);
      };
      pp$9.getTokenFromCode = function(code2) {
        switch (code2) {
          // The interpretation of a dot depends on whether it is followed
          // by a digit or another two dots.
          case 46:
            return this.readToken_dot();
          // Punctuation tokens.
          case 40:
            ++this.pos;
            return this.finishToken(types.parenL);
          case 41:
            ++this.pos;
            return this.finishToken(types.parenR);
          case 59:
            ++this.pos;
            return this.finishToken(types.semi);
          case 44:
            ++this.pos;
            return this.finishToken(types.comma);
          case 91:
            ++this.pos;
            return this.finishToken(types.bracketL);
          case 93:
            ++this.pos;
            return this.finishToken(types.bracketR);
          case 123:
            ++this.pos;
            return this.finishToken(types.braceL);
          case 125:
            ++this.pos;
            return this.finishToken(types.braceR);
          case 58:
            ++this.pos;
            return this.finishToken(types.colon);
          case 96:
            if (this.options.ecmaVersion < 6) {
              break;
            }
            ++this.pos;
            return this.finishToken(types.backQuote);
          case 48:
            var next = this.input.charCodeAt(this.pos + 1);
            if (next === 120 || next === 88) {
              return this.readRadixNumber(16);
            }
            if (this.options.ecmaVersion >= 6) {
              if (next === 111 || next === 79) {
                return this.readRadixNumber(8);
              }
              if (next === 98 || next === 66) {
                return this.readRadixNumber(2);
              }
            }
          // Anything else beginning with a digit is an integer, octal
          // number, or float.
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
            return this.readNumber(false);
          // Quotes produce strings.
          case 34:
          case 39:
            return this.readString(code2);
          // Operators are parsed inline in tiny state machines. '=' (61) is
          // often referred to. `finishOp` simply skips the amount of
          // characters it is given as second argument, and returns a token
          // of the type given by its first argument.
          case 47:
            return this.readToken_slash();
          case 37:
          case 42:
            return this.readToken_mult_modulo_exp(code2);
          case 124:
          case 38:
            return this.readToken_pipe_amp(code2);
          case 94:
            return this.readToken_caret();
          case 43:
          case 45:
            return this.readToken_plus_min(code2);
          case 60:
          case 62:
            return this.readToken_lt_gt(code2);
          case 61:
          case 33:
            return this.readToken_eq_excl(code2);
          case 63:
            return this.readToken_question();
          case 126:
            return this.finishOp(types.prefix, 1);
        }
        this.raise(this.pos, "Unexpected character '" + codePointToString$1(code2) + "'");
      };
      pp$9.finishOp = function(type, size) {
        var str = this.input.slice(this.pos, this.pos + size);
        this.pos += size;
        return this.finishToken(type, str);
      };
      pp$9.readRegexp = function() {
        var escaped, inClass, start = this.pos;
        for (; ; ) {
          if (this.pos >= this.input.length) {
            this.raise(start, "Unterminated regular expression");
          }
          var ch = this.input.charAt(this.pos);
          if (lineBreak.test(ch)) {
            this.raise(start, "Unterminated regular expression");
          }
          if (!escaped) {
            if (ch === "[") {
              inClass = true;
            } else if (ch === "]" && inClass) {
              inClass = false;
            } else if (ch === "/" && !inClass) {
              break;
            }
            escaped = ch === "\\";
          } else {
            escaped = false;
          }
          ++this.pos;
        }
        var pattern = this.input.slice(start, this.pos);
        ++this.pos;
        var flagsStart = this.pos;
        var flags = this.readWord1();
        if (this.containsEsc) {
          this.unexpected(flagsStart);
        }
        var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
        state.reset(start, pattern, flags);
        this.validateRegExpFlags(state);
        this.validateRegExpPattern(state);
        var value = null;
        try {
          value = new RegExp(pattern, flags);
        } catch (e) {
        }
        return this.finishToken(types.regexp, { pattern, flags, value });
      };
      pp$9.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
        var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
        var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
        var start = this.pos, total = 0, lastCode = 0;
        for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
          var code2 = this.input.charCodeAt(this.pos), val = void 0;
          if (allowSeparators && code2 === 95) {
            if (isLegacyOctalNumericLiteral) {
              this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
            }
            if (lastCode === 95) {
              this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
            }
            if (i === 0) {
              this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
            }
            lastCode = code2;
            continue;
          }
          if (code2 >= 97) {
            val = code2 - 97 + 10;
          } else if (code2 >= 65) {
            val = code2 - 65 + 10;
          } else if (code2 >= 48 && code2 <= 57) {
            val = code2 - 48;
          } else {
            val = Infinity;
          }
          if (val >= radix) {
            break;
          }
          lastCode = code2;
          total = total * radix + val;
        }
        if (allowSeparators && lastCode === 95) {
          this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
        }
        if (this.pos === start || len != null && this.pos - start !== len) {
          return null;
        }
        return total;
      };
      function stringToNumber(str, isLegacyOctalNumericLiteral) {
        if (isLegacyOctalNumericLiteral) {
          return parseInt(str, 8);
        }
        return parseFloat(str.replace(/_/g, ""));
      }
      function stringToBigInt(str) {
        if (typeof BigInt !== "function") {
          return null;
        }
        return BigInt(str.replace(/_/g, ""));
      }
      pp$9.readRadixNumber = function(radix) {
        var start = this.pos;
        this.pos += 2;
        var val = this.readInt(radix);
        if (val == null) {
          this.raise(this.start + 2, "Expected number in radix " + radix);
        }
        if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
          val = stringToBigInt(this.input.slice(start, this.pos));
          ++this.pos;
        } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
          this.raise(this.pos, "Identifier directly after number");
        }
        return this.finishToken(types.num, val);
      };
      pp$9.readNumber = function(startsWithDot) {
        var start = this.pos;
        if (!startsWithDot && this.readInt(10, void 0, true) === null) {
          this.raise(start, "Invalid number");
        }
        var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
        if (octal && this.strict) {
          this.raise(start, "Invalid number");
        }
        var next = this.input.charCodeAt(this.pos);
        if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
          var val$1 = stringToBigInt(this.input.slice(start, this.pos));
          ++this.pos;
          if (isIdentifierStart(this.fullCharCodeAtPos())) {
            this.raise(this.pos, "Identifier directly after number");
          }
          return this.finishToken(types.num, val$1);
        }
        if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
          octal = false;
        }
        if (next === 46 && !octal) {
          ++this.pos;
          this.readInt(10);
          next = this.input.charCodeAt(this.pos);
        }
        if ((next === 69 || next === 101) && !octal) {
          next = this.input.charCodeAt(++this.pos);
          if (next === 43 || next === 45) {
            ++this.pos;
          }
          if (this.readInt(10) === null) {
            this.raise(start, "Invalid number");
          }
        }
        if (isIdentifierStart(this.fullCharCodeAtPos())) {
          this.raise(this.pos, "Identifier directly after number");
        }
        var val = stringToNumber(this.input.slice(start, this.pos), octal);
        return this.finishToken(types.num, val);
      };
      pp$9.readCodePoint = function() {
        var ch = this.input.charCodeAt(this.pos), code2;
        if (ch === 123) {
          if (this.options.ecmaVersion < 6) {
            this.unexpected();
          }
          var codePos = ++this.pos;
          code2 = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
          ++this.pos;
          if (code2 > 1114111) {
            this.invalidStringToken(codePos, "Code point out of bounds");
          }
        } else {
          code2 = this.readHexChar(4);
        }
        return code2;
      };
      function codePointToString$1(code2) {
        if (code2 <= 65535) {
          return String.fromCharCode(code2);
        }
        code2 -= 65536;
        return String.fromCharCode((code2 >> 10) + 55296, (code2 & 1023) + 56320);
      }
      pp$9.readString = function(quote) {
        var out = "", chunkStart = ++this.pos;
        for (; ; ) {
          if (this.pos >= this.input.length) {
            this.raise(this.start, "Unterminated string constant");
          }
          var ch = this.input.charCodeAt(this.pos);
          if (ch === quote) {
            break;
          }
          if (ch === 92) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.readEscapedChar(false);
            chunkStart = this.pos;
          } else {
            if (isNewLine(ch, this.options.ecmaVersion >= 10)) {
              this.raise(this.start, "Unterminated string constant");
            }
            ++this.pos;
          }
        }
        out += this.input.slice(chunkStart, this.pos++);
        return this.finishToken(types.string, out);
      };
      var INVALID_TEMPLATE_ESCAPE_ERROR = {};
      pp$9.tryReadTemplateToken = function() {
        this.inTemplateElement = true;
        try {
          this.readTmplToken();
        } catch (err) {
          if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
            this.readInvalidTemplateToken();
          } else {
            throw err;
          }
        }
        this.inTemplateElement = false;
      };
      pp$9.invalidStringToken = function(position, message) {
        if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
          throw INVALID_TEMPLATE_ESCAPE_ERROR;
        } else {
          this.raise(position, message);
        }
      };
      pp$9.readTmplToken = function() {
        var out = "", chunkStart = this.pos;
        for (; ; ) {
          if (this.pos >= this.input.length) {
            this.raise(this.start, "Unterminated template");
          }
          var ch = this.input.charCodeAt(this.pos);
          if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
            if (this.pos === this.start && (this.type === types.template || this.type === types.invalidTemplate)) {
              if (ch === 36) {
                this.pos += 2;
                return this.finishToken(types.dollarBraceL);
              } else {
                ++this.pos;
                return this.finishToken(types.backQuote);
              }
            }
            out += this.input.slice(chunkStart, this.pos);
            return this.finishToken(types.template, out);
          }
          if (ch === 92) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.readEscapedChar(true);
            chunkStart = this.pos;
          } else if (isNewLine(ch)) {
            out += this.input.slice(chunkStart, this.pos);
            ++this.pos;
            switch (ch) {
              case 13:
                if (this.input.charCodeAt(this.pos) === 10) {
                  ++this.pos;
                }
              case 10:
                out += "\n";
                break;
              default:
                out += String.fromCharCode(ch);
                break;
            }
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
            chunkStart = this.pos;
          } else {
            ++this.pos;
          }
        }
      };
      pp$9.readInvalidTemplateToken = function() {
        for (; this.pos < this.input.length; this.pos++) {
          switch (this.input[this.pos]) {
            case "\\":
              ++this.pos;
              break;
            case "$":
              if (this.input[this.pos + 1] !== "{") {
                break;
              }
            // falls through
            case "`":
              return this.finishToken(types.invalidTemplate, this.input.slice(this.start, this.pos));
          }
        }
        this.raise(this.start, "Unterminated template");
      };
      pp$9.readEscapedChar = function(inTemplate) {
        var ch = this.input.charCodeAt(++this.pos);
        ++this.pos;
        switch (ch) {
          case 110:
            return "\n";
          // 'n' -> '\n'
          case 114:
            return "\r";
          // 'r' -> '\r'
          case 120:
            return String.fromCharCode(this.readHexChar(2));
          // 'x'
          case 117:
            return codePointToString$1(this.readCodePoint());
          // 'u'
          case 116:
            return "	";
          // 't' -> '\t'
          case 98:
            return "\b";
          // 'b' -> '\b'
          case 118:
            return "\v";
          // 'v' -> '\u000b'
          case 102:
            return "\f";
          // 'f' -> '\f'
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) {
              ++this.pos;
            }
          // '\r\n'
          case 10:
            if (this.options.locations) {
              this.lineStart = this.pos;
              ++this.curLine;
            }
            return "";
          case 56:
          case 57:
            if (inTemplate) {
              var codePos = this.pos - 1;
              this.invalidStringToken(
                codePos,
                "Invalid escape sequence in template string"
              );
              return null;
            }
          default:
            if (ch >= 48 && ch <= 55) {
              var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
              var octal = parseInt(octalStr, 8);
              if (octal > 255) {
                octalStr = octalStr.slice(0, -1);
                octal = parseInt(octalStr, 8);
              }
              this.pos += octalStr.length - 1;
              ch = this.input.charCodeAt(this.pos);
              if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
                this.invalidStringToken(
                  this.pos - 1 - octalStr.length,
                  inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
                );
              }
              return String.fromCharCode(octal);
            }
            if (isNewLine(ch)) {
              return "";
            }
            return String.fromCharCode(ch);
        }
      };
      pp$9.readHexChar = function(len) {
        var codePos = this.pos;
        var n = this.readInt(16, len);
        if (n === null) {
          this.invalidStringToken(codePos, "Bad character escape sequence");
        }
        return n;
      };
      pp$9.readWord1 = function() {
        this.containsEsc = false;
        var word = "", first = true, chunkStart = this.pos;
        var astral = this.options.ecmaVersion >= 6;
        while (this.pos < this.input.length) {
          var ch = this.fullCharCodeAtPos();
          if (isIdentifierChar(ch, astral)) {
            this.pos += ch <= 65535 ? 1 : 2;
          } else if (ch === 92) {
            this.containsEsc = true;
            word += this.input.slice(chunkStart, this.pos);
            var escStart = this.pos;
            if (this.input.charCodeAt(++this.pos) !== 117) {
              this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
            }
            ++this.pos;
            var esc = this.readCodePoint();
            if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
              this.invalidStringToken(escStart, "Invalid Unicode escape");
            }
            word += codePointToString$1(esc);
            chunkStart = this.pos;
          } else {
            break;
          }
          first = false;
        }
        return word + this.input.slice(chunkStart, this.pos);
      };
      pp$9.readWord = function() {
        var word = this.readWord1();
        var type = types.name;
        if (this.keywords.test(word)) {
          type = keywords$1[word];
        }
        return this.finishToken(type, word);
      };
      var version = "7.4.1";
      Parser.acorn = {
        Parser,
        version,
        defaultOptions,
        Position,
        SourceLocation,
        getLineInfo,
        Node,
        TokenType,
        tokTypes: types,
        keywordTypes: keywords$1,
        TokContext,
        tokContexts: types$1,
        isIdentifierChar,
        isIdentifierStart,
        Token,
        isNewLine,
        lineBreak,
        lineBreakG,
        nonASCIIwhitespace
      };
      function parse(input, options) {
        return Parser.parse(input, options);
      }
      function parseExpressionAt(input, pos, options) {
        return Parser.parseExpressionAt(input, pos, options);
      }
      function tokenizer(input, options) {
        return Parser.tokenizer(input, options);
      }
      exports4.Node = Node;
      exports4.Parser = Parser;
      exports4.Position = Position;
      exports4.SourceLocation = SourceLocation;
      exports4.TokContext = TokContext;
      exports4.Token = Token;
      exports4.TokenType = TokenType;
      exports4.defaultOptions = defaultOptions;
      exports4.getLineInfo = getLineInfo;
      exports4.isIdentifierChar = isIdentifierChar;
      exports4.isIdentifierStart = isIdentifierStart;
      exports4.isNewLine = isNewLine;
      exports4.keywordTypes = keywords$1;
      exports4.lineBreak = lineBreak;
      exports4.lineBreakG = lineBreakG;
      exports4.nonASCIIwhitespace = nonASCIIwhitespace;
      exports4.parse = parse;
      exports4.parseExpressionAt = parseExpressionAt;
      exports4.tokContexts = types$1;
      exports4.tokTypes = types;
      exports4.tokenizer = tokenizer;
      exports4.version = version;
      Object.defineProperty(exports4, "__esModule", { value: true });
    }));
  }
});

// node_modules/.pnpm/acorn-walk@7.2.0/node_modules/acorn-walk/dist/walk.js
var require_walk = __commonJS({
  "node_modules/.pnpm/acorn-walk@7.2.0/node_modules/acorn-walk/dist/walk.js"(exports3, module2) {
    (function(global2, factory) {
      typeof exports3 === "object" && typeof module2 !== "undefined" ? factory(exports3) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = global2 || self, factory((global2.acorn = global2.acorn || {}, global2.acorn.walk = {})));
    })(exports3, (function(exports4) {
      "use strict";
      function simple(node, visitors, baseVisitor, state, override) {
        if (!baseVisitor) {
          baseVisitor = base;
        }
        (function c(node2, st, override2) {
          var type = override2 || node2.type, found = visitors[type];
          baseVisitor[type](node2, st, c);
          if (found) {
            found(node2, st);
          }
        })(node, state, override);
      }
      function ancestor(node, visitors, baseVisitor, state, override) {
        var ancestors = [];
        if (!baseVisitor) {
          baseVisitor = base;
        }
        (function c(node2, st, override2) {
          var type = override2 || node2.type, found = visitors[type];
          var isNew = node2 !== ancestors[ancestors.length - 1];
          if (isNew) {
            ancestors.push(node2);
          }
          baseVisitor[type](node2, st, c);
          if (found) {
            found(node2, st || ancestors, ancestors);
          }
          if (isNew) {
            ancestors.pop();
          }
        })(node, state, override);
      }
      function recursive(node, state, funcs, baseVisitor, override) {
        var visitor = funcs ? make(funcs, baseVisitor || void 0) : baseVisitor;
        (function c(node2, st, override2) {
          visitor[override2 || node2.type](node2, st, c);
        })(node, state, override);
      }
      function makeTest(test2) {
        if (typeof test2 === "string") {
          return function(type) {
            return type === test2;
          };
        } else if (!test2) {
          return function() {
            return true;
          };
        } else {
          return test2;
        }
      }
      var Found = function Found2(node, state) {
        this.node = node;
        this.state = state;
      };
      function full(node, callback, baseVisitor, state, override) {
        if (!baseVisitor) {
          baseVisitor = base;
        }
        (function c(node2, st, override2) {
          var type = override2 || node2.type;
          baseVisitor[type](node2, st, c);
          if (!override2) {
            callback(node2, st, type);
          }
        })(node, state, override);
      }
      function fullAncestor(node, callback, baseVisitor, state) {
        if (!baseVisitor) {
          baseVisitor = base;
        }
        var ancestors = [];
        (function c(node2, st, override) {
          var type = override || node2.type;
          var isNew = node2 !== ancestors[ancestors.length - 1];
          if (isNew) {
            ancestors.push(node2);
          }
          baseVisitor[type](node2, st, c);
          if (!override) {
            callback(node2, st || ancestors, ancestors, type);
          }
          if (isNew) {
            ancestors.pop();
          }
        })(node, state);
      }
      function findNodeAt(node, start, end, test2, baseVisitor, state) {
        if (!baseVisitor) {
          baseVisitor = base;
        }
        test2 = makeTest(test2);
        try {
          (function c(node2, st, override) {
            var type = override || node2.type;
            if ((start == null || node2.start <= start) && (end == null || node2.end >= end)) {
              baseVisitor[type](node2, st, c);
            }
            if ((start == null || node2.start === start) && (end == null || node2.end === end) && test2(type, node2)) {
              throw new Found(node2, st);
            }
          })(node, state);
        } catch (e) {
          if (e instanceof Found) {
            return e;
          }
          throw e;
        }
      }
      function findNodeAround(node, pos, test2, baseVisitor, state) {
        test2 = makeTest(test2);
        if (!baseVisitor) {
          baseVisitor = base;
        }
        try {
          (function c(node2, st, override) {
            var type = override || node2.type;
            if (node2.start > pos || node2.end < pos) {
              return;
            }
            baseVisitor[type](node2, st, c);
            if (test2(type, node2)) {
              throw new Found(node2, st);
            }
          })(node, state);
        } catch (e) {
          if (e instanceof Found) {
            return e;
          }
          throw e;
        }
      }
      function findNodeAfter(node, pos, test2, baseVisitor, state) {
        test2 = makeTest(test2);
        if (!baseVisitor) {
          baseVisitor = base;
        }
        try {
          (function c(node2, st, override) {
            if (node2.end < pos) {
              return;
            }
            var type = override || node2.type;
            if (node2.start >= pos && test2(type, node2)) {
              throw new Found(node2, st);
            }
            baseVisitor[type](node2, st, c);
          })(node, state);
        } catch (e) {
          if (e instanceof Found) {
            return e;
          }
          throw e;
        }
      }
      function findNodeBefore(node, pos, test2, baseVisitor, state) {
        test2 = makeTest(test2);
        if (!baseVisitor) {
          baseVisitor = base;
        }
        var max;
        (function c(node2, st, override) {
          if (node2.start > pos) {
            return;
          }
          var type = override || node2.type;
          if (node2.end <= pos && (!max || max.node.end < node2.end) && test2(type, node2)) {
            max = new Found(node2, st);
          }
          baseVisitor[type](node2, st, c);
        })(node, state);
        return max;
      }
      var create = Object.create || function(proto) {
        function Ctor() {
        }
        Ctor.prototype = proto;
        return new Ctor();
      };
      function make(funcs, baseVisitor) {
        var visitor = create(baseVisitor || base);
        for (var type in funcs) {
          visitor[type] = funcs[type];
        }
        return visitor;
      }
      function skipThrough(node, st, c) {
        c(node, st);
      }
      function ignore(_node, _st, _c) {
      }
      var base = {};
      base.Program = base.BlockStatement = function(node, st, c) {
        for (var i = 0, list2 = node.body; i < list2.length; i += 1) {
          var stmt = list2[i];
          c(stmt, st, "Statement");
        }
      };
      base.Statement = skipThrough;
      base.EmptyStatement = ignore;
      base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression = function(node, st, c) {
        return c(node.expression, st, "Expression");
      };
      base.IfStatement = function(node, st, c) {
        c(node.test, st, "Expression");
        c(node.consequent, st, "Statement");
        if (node.alternate) {
          c(node.alternate, st, "Statement");
        }
      };
      base.LabeledStatement = function(node, st, c) {
        return c(node.body, st, "Statement");
      };
      base.BreakStatement = base.ContinueStatement = ignore;
      base.WithStatement = function(node, st, c) {
        c(node.object, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.SwitchStatement = function(node, st, c) {
        c(node.discriminant, st, "Expression");
        for (var i$1 = 0, list$1 = node.cases; i$1 < list$1.length; i$1 += 1) {
          var cs = list$1[i$1];
          if (cs.test) {
            c(cs.test, st, "Expression");
          }
          for (var i = 0, list2 = cs.consequent; i < list2.length; i += 1) {
            var cons = list2[i];
            c(cons, st, "Statement");
          }
        }
      };
      base.SwitchCase = function(node, st, c) {
        if (node.test) {
          c(node.test, st, "Expression");
        }
        for (var i = 0, list2 = node.consequent; i < list2.length; i += 1) {
          var cons = list2[i];
          c(cons, st, "Statement");
        }
      };
      base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function(node, st, c) {
        if (node.argument) {
          c(node.argument, st, "Expression");
        }
      };
      base.ThrowStatement = base.SpreadElement = function(node, st, c) {
        return c(node.argument, st, "Expression");
      };
      base.TryStatement = function(node, st, c) {
        c(node.block, st, "Statement");
        if (node.handler) {
          c(node.handler, st);
        }
        if (node.finalizer) {
          c(node.finalizer, st, "Statement");
        }
      };
      base.CatchClause = function(node, st, c) {
        if (node.param) {
          c(node.param, st, "Pattern");
        }
        c(node.body, st, "Statement");
      };
      base.WhileStatement = base.DoWhileStatement = function(node, st, c) {
        c(node.test, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.ForStatement = function(node, st, c) {
        if (node.init) {
          c(node.init, st, "ForInit");
        }
        if (node.test) {
          c(node.test, st, "Expression");
        }
        if (node.update) {
          c(node.update, st, "Expression");
        }
        c(node.body, st, "Statement");
      };
      base.ForInStatement = base.ForOfStatement = function(node, st, c) {
        c(node.left, st, "ForInit");
        c(node.right, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.ForInit = function(node, st, c) {
        if (node.type === "VariableDeclaration") {
          c(node, st);
        } else {
          c(node, st, "Expression");
        }
      };
      base.DebuggerStatement = ignore;
      base.FunctionDeclaration = function(node, st, c) {
        return c(node, st, "Function");
      };
      base.VariableDeclaration = function(node, st, c) {
        for (var i = 0, list2 = node.declarations; i < list2.length; i += 1) {
          var decl = list2[i];
          c(decl, st);
        }
      };
      base.VariableDeclarator = function(node, st, c) {
        c(node.id, st, "Pattern");
        if (node.init) {
          c(node.init, st, "Expression");
        }
      };
      base.Function = function(node, st, c) {
        if (node.id) {
          c(node.id, st, "Pattern");
        }
        for (var i = 0, list2 = node.params; i < list2.length; i += 1) {
          var param = list2[i];
          c(param, st, "Pattern");
        }
        c(node.body, st, node.expression ? "Expression" : "Statement");
      };
      base.Pattern = function(node, st, c) {
        if (node.type === "Identifier") {
          c(node, st, "VariablePattern");
        } else if (node.type === "MemberExpression") {
          c(node, st, "MemberPattern");
        } else {
          c(node, st);
        }
      };
      base.VariablePattern = ignore;
      base.MemberPattern = skipThrough;
      base.RestElement = function(node, st, c) {
        return c(node.argument, st, "Pattern");
      };
      base.ArrayPattern = function(node, st, c) {
        for (var i = 0, list2 = node.elements; i < list2.length; i += 1) {
          var elt = list2[i];
          if (elt) {
            c(elt, st, "Pattern");
          }
        }
      };
      base.ObjectPattern = function(node, st, c) {
        for (var i = 0, list2 = node.properties; i < list2.length; i += 1) {
          var prop = list2[i];
          if (prop.type === "Property") {
            if (prop.computed) {
              c(prop.key, st, "Expression");
            }
            c(prop.value, st, "Pattern");
          } else if (prop.type === "RestElement") {
            c(prop.argument, st, "Pattern");
          }
        }
      };
      base.Expression = skipThrough;
      base.ThisExpression = base.Super = base.MetaProperty = ignore;
      base.ArrayExpression = function(node, st, c) {
        for (var i = 0, list2 = node.elements; i < list2.length; i += 1) {
          var elt = list2[i];
          if (elt) {
            c(elt, st, "Expression");
          }
        }
      };
      base.ObjectExpression = function(node, st, c) {
        for (var i = 0, list2 = node.properties; i < list2.length; i += 1) {
          var prop = list2[i];
          c(prop, st);
        }
      };
      base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
      base.SequenceExpression = function(node, st, c) {
        for (var i = 0, list2 = node.expressions; i < list2.length; i += 1) {
          var expr = list2[i];
          c(expr, st, "Expression");
        }
      };
      base.TemplateLiteral = function(node, st, c) {
        for (var i = 0, list2 = node.quasis; i < list2.length; i += 1) {
          var quasi = list2[i];
          c(quasi, st);
        }
        for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1) {
          var expr = list$1[i$1];
          c(expr, st, "Expression");
        }
      };
      base.TemplateElement = ignore;
      base.UnaryExpression = base.UpdateExpression = function(node, st, c) {
        c(node.argument, st, "Expression");
      };
      base.BinaryExpression = base.LogicalExpression = function(node, st, c) {
        c(node.left, st, "Expression");
        c(node.right, st, "Expression");
      };
      base.AssignmentExpression = base.AssignmentPattern = function(node, st, c) {
        c(node.left, st, "Pattern");
        c(node.right, st, "Expression");
      };
      base.ConditionalExpression = function(node, st, c) {
        c(node.test, st, "Expression");
        c(node.consequent, st, "Expression");
        c(node.alternate, st, "Expression");
      };
      base.NewExpression = base.CallExpression = function(node, st, c) {
        c(node.callee, st, "Expression");
        if (node.arguments) {
          for (var i = 0, list2 = node.arguments; i < list2.length; i += 1) {
            var arg = list2[i];
            c(arg, st, "Expression");
          }
        }
      };
      base.MemberExpression = function(node, st, c) {
        c(node.object, st, "Expression");
        if (node.computed) {
          c(node.property, st, "Expression");
        }
      };
      base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function(node, st, c) {
        if (node.declaration) {
          c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
        }
        if (node.source) {
          c(node.source, st, "Expression");
        }
      };
      base.ExportAllDeclaration = function(node, st, c) {
        if (node.exported) {
          c(node.exported, st);
        }
        c(node.source, st, "Expression");
      };
      base.ImportDeclaration = function(node, st, c) {
        for (var i = 0, list2 = node.specifiers; i < list2.length; i += 1) {
          var spec = list2[i];
          c(spec, st);
        }
        c(node.source, st, "Expression");
      };
      base.ImportExpression = function(node, st, c) {
        c(node.source, st, "Expression");
      };
      base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;
      base.TaggedTemplateExpression = function(node, st, c) {
        c(node.tag, st, "Expression");
        c(node.quasi, st, "Expression");
      };
      base.ClassDeclaration = base.ClassExpression = function(node, st, c) {
        return c(node, st, "Class");
      };
      base.Class = function(node, st, c) {
        if (node.id) {
          c(node.id, st, "Pattern");
        }
        if (node.superClass) {
          c(node.superClass, st, "Expression");
        }
        c(node.body, st);
      };
      base.ClassBody = function(node, st, c) {
        for (var i = 0, list2 = node.body; i < list2.length; i += 1) {
          var elt = list2[i];
          c(elt, st);
        }
      };
      base.MethodDefinition = base.Property = function(node, st, c) {
        if (node.computed) {
          c(node.key, st, "Expression");
        }
        c(node.value, st, "Expression");
      };
      exports4.ancestor = ancestor;
      exports4.base = base;
      exports4.findNodeAfter = findNodeAfter;
      exports4.findNodeAround = findNodeAround;
      exports4.findNodeAt = findNodeAt;
      exports4.findNodeBefore = findNodeBefore;
      exports4.full = full;
      exports4.fullAncestor = fullAncestor;
      exports4.make = make;
      exports4.recursive = recursive;
      exports4.simple = simple;
      Object.defineProperty(exports4, "__esModule", { value: true });
    }));
  }
});

// src/structjs.ts
var structjs_exports = {};
__export(structjs_exports, {
  BinWriter: () => BinWriter,
  JSONError: () => JSONError,
  STABLE_ID_BASE: () => STABLE_ID_BASE,
  STABLE_ID_LIMIT: () => STABLE_ID_LIMIT,
  STRUCT: () => STRUCT,
  _truncateDollarSign: () => _truncateDollarSign,
  binpack: () => struct_binpack_exports,
  consoleLogger: () => consoleLogger,
  deriveStructManager: () => deriveStructManager,
  filehelper: () => struct_filehelper_exports,
  formatJSON: () => formatJSON2,
  getEndian: () => getEndian,
  inherit: () => inherit,
  inlineRegister: () => inlineRegister,
  isRegistered: () => isRegistered,
  manager: () => manager,
  migrateJSON: () => migrateJSON,
  parser: () => struct_parser_exports,
  parseutil: () => struct_parseutil_exports,
  readJSON: () => readJSON,
  readObject: () => readObject,
  register: () => register,
  setAllowOverriding: () => setAllowOverriding,
  setDebugMode: () => setDebugMode,
  setEndian: () => setEndian,
  setTruncateDollarSign: () => setTruncateDollarSign,
  setWarningMode: () => setWarningMode,
  stableStructId: () => stableStructId,
  tinyeval: () => tinyeval,
  truncateDollarSign: () => truncateDollarSign2,
  typesystem: () => struct_typesystem_exports,
  unpack_context: () => unpack_context,
  unregister: () => unregister,
  useTinyEval: () => useTinyEval,
  validateJSON: () => validateJSON2,
  validateStructs: () => validateStructs,
  writeJSON: () => writeJSON,
  writeObject: () => writeObject,
  write_scripts: () => write_scripts
});
module.exports = __toCommonJS(structjs_exports);

// src/struct_parser.ts
var struct_parser_exports = {};
__export(struct_parser_exports, {
  ArrayTypes: () => ArrayTypes,
  NStruct: () => NStruct,
  StructEnum: () => StructEnum,
  StructTypeMap: () => StructTypeMap,
  StructTypes: () => StructTypes,
  ValueTypes: () => ValueTypes,
  stripComments: () => stripComments,
  struct_parse: () => struct_parse
});

// src/struct_parseutil.ts
var struct_parseutil_exports = {};
__export(struct_parseutil_exports, {
  PUTIL_ParseError: () => PUTIL_ParseError,
  lexer: () => lexer,
  parser: () => parser,
  tokdef: () => tokdef,
  token: () => token
});

// src/struct_util.ts
var colormap = {
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "reset": 0,
  "grey": 2,
  "orange": 202,
  "pink": 198,
  "brown": 314,
  "lightred": 91,
  "peach": 210
};
var PARSE_STRUCTS_DUMMY = /* @__PURE__ */ Symbol.for("nstructjs.parseStructsDummy");
function isParseStructsDummy(cls) {
  return !!cls && !!cls[PARSE_STRUCTS_DUMMY];
}
function tab(n, chr = " ") {
  let t = "";
  for (let i = 0; i < n; i++) {
    t += chr;
  }
  return t;
}
var termColorMap = {};
for (const k in colormap) {
  termColorMap[k] = colormap[k];
  termColorMap[colormap[k]] = k;
}
function termColor(s, c) {
  let str;
  if (typeof s === "symbol") {
    str = s.toString();
  } else {
    str = "" + s;
  }
  let code2;
  if (typeof c === "string" && c in colormap) {
    code2 = colormap[c];
  } else {
    code2 = typeof c === "number" ? c : parseInt(c, 10);
  }
  if (code2 > 107) {
    const s2 = "\x1B[38;5;" + code2 + "m";
    return s2 + str + "\x1B[0m";
  }
  return "\x1B[" + code2 + "m" + str + "\x1B[0m";
}
function termPrint(...args) {
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
  const endtag = "\x1B[0m";
  function tok(s3, type) {
    return {
      type,
      value: s3
    };
  }
  const tokdefs = [
    [re1a, "start"],
    [re1b, "start"],
    [re2, "end"]
  ];
  let s2 = s;
  const tokens = [];
  while (s2.length > 0) {
    let ok = false;
    let mini = void 0;
    let minslice = void 0;
    let mintype = void 0;
    for (const tk of tokdefs) {
      const idx = s2.search(tk[0]);
      if (idx >= 0 && (mini === void 0 || idx < mini)) {
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
    if (mini > 0) {
      const chunk = s2.slice(0, mini);
      tokens.push(tok(chunk, "chunk"));
    }
    s2 = s2.slice(mini + minslice.length, s2.length);
    const t = tok(minslice, mintype);
    tokens.push(t);
  }
  if (s2.length > 0) {
    tokens.push(tok(s2, "chunk"));
  }
  const stack = [];
  let cur;
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
function list(iter) {
  const ret = [];
  for (const item of iter) {
    ret.push(item);
  }
  return ret;
}

// src/struct_parseutil.ts
function print_lines(ld, lineno, col, printColors, tokenObj) {
  let buf = "";
  const lines = ld.split("\n");
  const istart = Math.max(lineno - 5, 0);
  const iend = Math.min(lineno + 3, lines.length);
  const color3 = printColors ? (c) => c : termColor;
  for (let i = istart; i < iend; i++) {
    let l = "" + (i + 1);
    while (l.length < 3) {
      l = " " + l;
    }
    l += `: ${lines[i]}
`;
    if (i === lineno && tokenObj && tokenObj.value.length === 1) {
      l = l.slice(0, col + 5) + color3(l[col + 5], "yellow") + l.slice(col + 6, l.length);
    }
    buf += l;
    if (i === lineno) {
      let colstr = "     ";
      for (let j = 0; j < col; j++) {
        colstr += " ";
      }
      colstr += color3("^", "red");
      buf += colstr + "\n";
    }
  }
  buf = "------------------\n" + buf + "\n==================\n";
  return buf;
}
var token = class {
  constructor(type, val, lexpos, lineno, lex, p, col) {
    this.type = type;
    this.value = val;
    this.lexpos = lexpos;
    this.lineno = lineno;
    this.col = col;
    this.lexer = lex;
    this.parser = p;
  }
  toString() {
    if (this.value !== void 0) return "token(type=" + this.type + ", value='" + this.value + "')";
    else return "token(type=" + this.type + ")";
  }
};
var tokdef = class {
  constructor(name, regexpr, func, example) {
    this.name = name;
    this.re = regexpr;
    this.reSticky = regexpr ? new RegExp(regexpr.source, regexpr.flags.replace(/[gy]/g, "") + "y") : void 0;
    this.func = func;
    this.example = example;
    if (example === void 0 && regexpr) {
      let s = "" + regexpr;
      if (s.startsWith("/") && s.endsWith("/")) {
        s = s.slice(1, s.length - 1);
      }
      if (s.startsWith("\\")) {
        s = s.slice(1, s.length);
      }
      s = s.trim();
      if (s.length === 1) {
        this.example = s;
      }
    }
  }
};
var PUTIL_ParseError = class extends Error {
  constructor(msg) {
    super(msg);
  }
};
var lexer = class {
  constructor(tokdefArr, errfunc) {
    this.tokdef = tokdefArr;
    this.tokens = new Array();
    this.lexpos = 0;
    this.lexdata = "";
    this.colmap = void 0;
    this.lineno = 0;
    this.printTokens = false;
    this.linestart = 0;
    this.errfunc = errfunc;
    this.linemap = void 0;
    this.tokints = {};
    for (let i = 0; i < tokdefArr.length; i++) {
      this.tokints[tokdefArr[i].name] = i;
    }
    this.statestack = [["__main__", 0]];
    this.states = { "__main__": [tokdefArr, errfunc] };
    this.statedata = 0;
    this.peeked_tokens = [];
    this.logger = function(...args) {
      console.log(...args);
    };
  }
  add_state(name, tokdefArr, errfunc) {
    if (errfunc === void 0) {
      errfunc = function(_lexer2) {
        return true;
      };
    }
    this.states[name] = [tokdefArr, errfunc];
  }
  tok_int(_name) {
  }
  push_state(state, statedata) {
    this.statestack.push([state, statedata]);
    const st = this.states[state];
    this.statedata = statedata;
    this.tokdef = st[0];
    this.errfunc = st[1];
  }
  pop_state() {
    const item = this.statestack[this.statestack.length - 1];
    const state = this.states[item[0]];
    this.tokdef = state[0];
    this.errfunc = state[1];
    this.statedata = item[1];
  }
  input(str) {
    const linemap = this.linemap = new Array(str.length);
    let lineno = 0;
    let col = 0;
    const colmap = this.colmap = new Array(str.length);
    for (let i = 0; i < str.length; i++, col++) {
      const c = str[i];
      linemap[i] = lineno;
      colmap[i] = col;
      if (c === "\n") {
        lineno++;
        col = 0;
      }
    }
    while (this.statestack.length > 1) {
      this.pop_state();
    }
    this.lexdata = str;
    this.lexpos = 0;
    this.lineno = 0;
    this.tokens = new Array();
    this.peeked_tokens = [];
  }
  error() {
    if (this.errfunc !== void 0 && !this.errfunc(this)) return;
    const safepos = Math.min(this.lexpos, this.lexdata.length - 1);
    const line = this.linemap[safepos];
    const col = this.colmap[safepos];
    const s = print_lines(this.lexdata, line, col, true);
    this.logger("  " + s);
    this.logger("Syntax error near line " + (this.lineno + 1));
    throw new PUTIL_ParseError("Parse error");
  }
  peek() {
    const tok = this.next(true);
    if (tok === void 0) return void 0;
    this.peeked_tokens.push(tok);
    return tok;
  }
  peek_i(i) {
    while (this.peeked_tokens.length <= i) {
      const tok = this.peek();
      if (tok === void 0) {
        return void 0;
      }
    }
    return this.peeked_tokens[i];
  }
  peeknext() {
    if (this.peeked_tokens.length > 0) {
      return this.peeked_tokens[0];
    }
    return this.peek();
  }
  at_end() {
    return this.lexpos >= this.lexdata.length && this.peeked_tokens.length === 0;
  }
  //ignore_peek is optional, false
  next(ignore_peek) {
    if (!ignore_peek && this.peeked_tokens.length > 0) {
      const tok2 = this.peeked_tokens[0];
      this.peeked_tokens.shift();
      if (!ignore_peek && this.printTokens) {
        this.logger("" + tok2);
      }
      return tok2;
    }
    if (this.lexpos >= this.lexdata.length) return void 0;
    const ts = this.tokdef;
    const tlen = ts.length;
    const lexpos = this.lexpos;
    const lexdata = this.lexdata;
    let max_res = 0;
    let theres = void 0;
    for (let i = 0; i < tlen; i++) {
      const t = ts[i];
      const re = t.reSticky;
      if (re === void 0) continue;
      re.lastIndex = lexpos;
      const res = re.exec(lexdata);
      if (res !== null && res[0].length > max_res) {
        theres = [t, res[0]];
        max_res = res[0].length;
      }
    }
    if (theres === void 0) {
      this.error();
      return;
    }
    const def = theres[0];
    const col = this.colmap[Math.min(this.lexpos, this.lexdata.length - 1)];
    if (this.lexpos < this.lexdata.length) {
      this.lineno = this.linemap[this.lexpos];
    }
    let tok = new token(def.name, theres[1], this.lexpos, this.lineno, this, void 0, col);
    this.lexpos += tok.value.length;
    if (def.func) {
      tok = def.func(tok);
      if (tok === void 0) {
        return this.next();
      }
    }
    if (!ignore_peek && this.printTokens) {
      this.logger("" + tok);
    }
    return tok;
  }
};
var parser = class {
  constructor(lex, errfunc) {
    this.lexer = lex;
    this.errfunc = errfunc;
    this.start = void 0;
    this.logger = function(...args) {
      console.log(...args);
    };
  }
  parse(data, err_on_unconsumed) {
    if (err_on_unconsumed === void 0) err_on_unconsumed = true;
    if (data !== void 0) this.lexer.input(data);
    const ret = this.start(this);
    if (err_on_unconsumed && !this.lexer.at_end() && this.lexer.next() !== void 0) {
      this.error(void 0, "parser did not consume entire input");
    }
    return ret;
  }
  input(data) {
    this.lexer.input(data);
  }
  error(tokenObj, msg) {
    let estr;
    if (msg === void 0) msg = "";
    if (tokenObj === void 0) estr = "Parse error at end of input: " + msg;
    else estr = `Parse error at line ${tokenObj.lineno + 1}:${tokenObj.col + 1}: ${msg}`;
    let ld = this.lexer.lexdata;
    const lineno = tokenObj ? tokenObj.lineno : this.lexer.linemap[this.lexer.linemap.length - 1];
    const col = tokenObj ? tokenObj.col : 0;
    ld = ld.replace(/\r/g, "");
    this.logger(print_lines(ld, lineno, col, true, tokenObj));
    this.logger(estr);
    if (this.errfunc) {
      this.errfunc(tokenObj, msg);
    }
    throw new PUTIL_ParseError(estr);
  }
  peek() {
    const tok = this.lexer.peek();
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  peek_i(i) {
    const tok = this.lexer.peek_i(i);
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  peeknext() {
    const tok = this.lexer.peeknext();
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  next() {
    const tok = this.lexer.next();
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  optional(type) {
    const tok = this.peeknext();
    if (tok === void 0) return false;
    if (tok.type === type) {
      this.next();
      return true;
    }
    return false;
  }
  at_end() {
    return this.lexer.at_end();
  }
  expect(type, msg) {
    const tok = this.next();
    if (msg === void 0) {
      msg = type;
      for (const tk of this.lexer.tokdef) {
        if (tk.name === type && tk.example) {
          msg = tk.example;
        }
      }
    }
    if (tok === void 0 || tok.type !== type) {
      this.error(tok, "Expected " + msg);
    }
    return tok.value;
  }
};

// src/types.ts
var StructEnum = {
  INT: 0,
  FLOAT: 1,
  DOUBLE: 2,
  STRING: 7,
  STATIC_STRING: 8,
  STRUCT: 9,
  TSTRUCT: 10,
  ARRAY: 11,
  ITER: 12,
  SHORT: 13,
  BYTE: 14,
  BOOL: 15,
  ITERKEYS: 16,
  UINT: 17,
  USHORT: 18,
  STATIC_ARRAY: 19,
  SIGNED_BYTE: 20,
  OPTIONAL: 21,
  ARRAYBUFFER: 22
};
var TokSymbol = /* @__PURE__ */ Symbol("token-info");
function setTokInfo(obj, info) {
  obj[TokSymbol] = info;
}
function getTokInfo(obj) {
  if (obj && typeof obj === "object") {
    return obj[TokSymbol];
  }
  return void 0;
}

// src/struct_parser.ts
var NStruct = class {
  constructor(name, loc) {
    this.fields = [];
    this.id = -1;
    this.name = name;
    this.loc = loc;
  }
};
var ArrayTypes = /* @__PURE__ */ new Set([
  StructEnum.STATIC_ARRAY,
  StructEnum.ARRAY,
  StructEnum.ITERKEYS,
  StructEnum.ITER
]);
var ValueTypes = /* @__PURE__ */ new Set([
  StructEnum.INT,
  StructEnum.FLOAT,
  StructEnum.DOUBLE,
  StructEnum.STRING,
  StructEnum.STATIC_STRING,
  StructEnum.SHORT,
  StructEnum.BYTE,
  StructEnum.BOOL,
  StructEnum.UINT,
  StructEnum.USHORT,
  StructEnum.SIGNED_BYTE
]);
var StructTypes = {
  "int": StructEnum.INT,
  "uint": StructEnum.UINT,
  "ushort": StructEnum.USHORT,
  "float": StructEnum.FLOAT,
  "double": StructEnum.DOUBLE,
  "string": StructEnum.STRING,
  "static_string": StructEnum.STATIC_STRING,
  "struct": StructEnum.STRUCT,
  "abstract": StructEnum.TSTRUCT,
  "array": StructEnum.ARRAY,
  "iter": StructEnum.ITER,
  "short": StructEnum.SHORT,
  "byte": StructEnum.BYTE,
  "bool": StructEnum.BOOL,
  "iterkeys": StructEnum.ITERKEYS,
  "sbyte": StructEnum.SIGNED_BYTE,
  "optional": StructEnum.OPTIONAL
};
var StructTypeMap = {};
for (const k in StructTypes) {
  StructTypeMap[StructTypes[k]] = k;
}
function gen_tabstr(t) {
  let s = "";
  for (let i = 0; i < t; i++) {
    s += "  ";
  }
  return s;
}
function stripComments(buf) {
  let s = "";
  const MAIN = 0, COMMENT = 1, STR = 2;
  let n;
  let strs = /* @__PURE__ */ new Set(["'", '"', "`"]);
  let mode = MAIN;
  let strlit = "";
  let escape = false;
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    n = i < buf.length - 1 ? buf[i + 1] : void 0;
    switch (mode) {
      case MAIN:
        if (c === "/" && n === "/") {
          mode = COMMENT;
          continue;
        }
        if (strs.has(c)) {
          strlit = c;
          mode = STR;
        }
        s += c;
        break;
      case COMMENT:
        if (n === "\n") {
          mode = MAIN;
        }
        break;
      case STR:
        if (c === strlit && !escape) {
          mode = MAIN;
        }
        s += c;
        break;
    }
    if (c === "\\") {
      escape = !escape;
    } else {
      escape = false;
    }
  }
  return s;
}
function StructParser() {
  const basic_types = /* @__PURE__ */ new Set(["int", "float", "double", "string", "short", "byte", "sbyte", "bool", "uint", "ushort"]);
  const arraybuffer_types = /* @__PURE__ */ new Set(["int", "uint", "short", "ushort", "byte", "sbyte", "float", "double"]);
  const reserved_tokens = /* @__PURE__ */ new Set([
    "int",
    "float",
    "double",
    "string",
    "static_string",
    "array",
    "iter",
    "abstract",
    "short",
    "byte",
    "sbyte",
    "bool",
    "iterkeys",
    "uint",
    "ushort",
    "static_array",
    "optional"
  ]);
  function tk(name, re, func, example) {
    return new tokdef(name, re, func, example);
  }
  const tokens = [
    tk(
      "ID",
      /[a-zA-Z_$]+[a-zA-Z0-9_\.$]*/,
      function(t) {
        if (reserved_tokens.has(t.value)) {
          t.type = t.value.toUpperCase();
        }
        return t;
      },
      "identifier"
    ),
    tk("OPEN", /\{/),
    tk("EQUALS", /=/),
    tk("CLOSE", /}/),
    tk("STRLIT", /\"[^"]*\"/, (t) => {
      t.value = t.value.slice(1, t.value.length - 1);
      return t;
    }),
    tk("STRLIT", /\'[^']*\'/, (t) => {
      t.value = t.value.slice(1, t.value.length - 1);
      return t;
    }),
    tk("COLON", /:/),
    tk("OPT_COLON", /\?:/),
    tk("SOPEN", /\[/),
    tk("SCLOSE", /\]/),
    tk("JSCRIPT", /\|/, function(t) {
      let js = "";
      const lex2 = t.lexer;
      let p;
      while (lex2.lexpos < lex2.lexdata.length) {
        const c = lex2.lexdata[lex2.lexpos];
        if (c === "\n") break;
        if (c === "/" && p === "/") {
          js = js.slice(0, js.length - 1);
          lex2.lexpos--;
          break;
        }
        js += c;
        lex2.lexpos++;
        p = c;
      }
      while (js.trim().endsWith(";")) {
        js = js.slice(0, js.length - 1);
        lex2.lexpos--;
      }
      t.value = js.trim();
      return t;
    }),
    tk("COMMENT", /\/\/.*[\n\r]/),
    tk("LPARAM", /\(/),
    tk("RPARAM", /\)/),
    tk("COMMA", /,/),
    tk("NUM", /[0-9]+/, void 0, "number"),
    tk("SEMI", /;/),
    tk(
      "NEWLINE",
      /\n/,
      function(t) {
        t.lexer.lineno += 1;
        return void 0;
      },
      "newline"
    ),
    tk(
      "SPACE",
      / |\t/,
      function(_t) {
        return void 0;
      },
      "whitespace"
    )
  ];
  reserved_tokens.forEach(function(rt) {
    tokens.push(tk(rt.toUpperCase()));
  });
  function errfunc(_lexer) {
    return true;
  }
  class Lexer extends lexer {
    input(str) {
      return super.input(str);
    }
  }
  const lex = new Lexer(tokens, errfunc);
  const parserInst = new parser(lex);
  function p_Static_String(p) {
    p.expect("STATIC_STRING");
    p.expect("SOPEN");
    const num = parseInt(p.expect("NUM"), 10);
    p.expect("SCLOSE");
    return { type: StructEnum.STATIC_STRING, data: { maxlength: num } };
  }
  function p_ArrayBuffer(p) {
    const tok1 = p.peek_i(0);
    const tok2 = p.peek_i(1);
    if (!tok1 || !tok2) {
      return void 0;
    }
    if (tok1.type !== "ID" || tok1.value !== "arraybuffer" || tok2.type !== "LPARAM") {
      return void 0;
    }
    p.next();
    p.next();
    const type = p.next();
    if (type === void 0) {
      return p.error(void 0, "Expected type for arraybuffer");
    }
    const tname = type.value.toLowerCase();
    if (!arraybuffer_types.has(tname)) {
      p.error(type, "Expected a numeric element type for arraybuffer, got '" + type.value + "'");
    }
    p.expect("RPARAM");
    return { type: StructEnum.ARRAYBUFFER, data: { type: tname } };
  }
  function p_Array(p) {
    p.expect("ARRAY");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = (arraytype.data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return { type: StructEnum.ARRAY, data: { type: arraytype, iname: itername } };
  }
  function p_Iter(p) {
    p.expect("ITER");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = (arraytype.data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return { type: StructEnum.ITER, data: { type: arraytype, iname: itername } };
  }
  function p_StaticArray(p) {
    p.expect("STATIC_ARRAY");
    p.expect("SOPEN");
    const arraytype = p_Type(p);
    let itername = "";
    p.expect("COMMA");
    let size = parseInt(p.expect("NUM"), 10);
    if (size < 0 || Math.abs(size - Math.floor(size)) > 1e-6) {
      p.error(void 0, "Expected an integer");
    }
    size = Math.floor(size);
    if (p.optional("COMMA")) {
      const td = p_Type(p);
      itername = td.data || "";
    }
    p.expect("SCLOSE");
    return { type: StructEnum.STATIC_ARRAY, data: { type: arraytype, size, iname: itername } };
  }
  function p_IterKeys(p) {
    p.expect("ITERKEYS");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = (arraytype.data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return { type: StructEnum.ITERKEYS, data: { type: arraytype, iname: itername } };
  }
  function p_Abstract(p) {
    p.expect("ABSTRACT");
    p.expect("LPARAM");
    const type = p.expect("ID");
    let jsonKeyword = "_structName";
    if (p.optional("COMMA")) {
      jsonKeyword = p.expect("STRLIT");
    }
    p.expect("RPARAM");
    return {
      type: StructEnum.TSTRUCT,
      data: type,
      jsonKeyword
    };
  }
  function p_Optional(p) {
    p.expect("OPTIONAL");
    p.expect("LPARAM");
    const type = p_Type(p);
    p.expect("RPARAM");
    return {
      type: StructEnum.OPTIONAL,
      data: type
    };
  }
  function p_Type(p) {
    const tok = p.peeknext();
    if (!tok) {
      p.error(void 0, "Unexpected end of input");
    }
    const pbuffer = p_ArrayBuffer(p);
    if (pbuffer) {
      return pbuffer;
    } else if (tok.type === "ID") {
      p.next();
      return { type: StructEnum.STRUCT, data: tok.value };
    } else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return { type: StructTypes[tok.type.toLowerCase()] };
    } else if (tok.type === "ARRAY") {
      return p_Array(p);
    } else if (tok.type === "ITER") {
      return p_Iter(p);
    } else if (tok.type === "ITERKEYS") {
      return p_IterKeys(p);
    } else if (tok.type === "STATIC_ARRAY") {
      return p_StaticArray(p);
    } else if (tok.type === "STATIC_STRING") {
      return p_Static_String(p);
    } else if (tok.type === "ABSTRACT") {
      return p_Abstract(p);
    } else if (tok.type === "DATAREF") {
      p.error(tok, "DATAREF type is not supported");
    } else if (tok.type === "OPTIONAL") {
      return p_Optional(p);
    } else {
      p.error(tok, "invalid type " + tok.type);
    }
  }
  function p_ID_or_num(p) {
    const t = p.peeknext();
    if (t && t.type === "NUM") {
      p.next();
      return t.value;
    } else {
      return p.expect("ID", "struct field name");
    }
  }
  function p_Field(p) {
    const name = p_ID_or_num(p);
    const loc = getLoc(p);
    let is_opt = false;
    const next = p.peeknext();
    if (next && next.type === "OPT_COLON") {
      p.expect("OPT_COLON");
      is_opt = true;
    } else {
      p.expect("COLON");
    }
    let type = p_Type(p);
    if (is_opt) {
      type = {
        type: StructEnum.OPTIONAL,
        data: type
      };
    }
    let get = void 0;
    let tok = p.peeknext();
    if (tok && tok.type === "JSCRIPT") {
      get = tok.value;
      p.next();
    }
    p.expect("SEMI");
    tok = p.peeknext();
    let comment = "";
    if (tok && tok.type === "COMMENT") {
      comment = tok.value;
      p.next();
    }
    return { name, type, get, comment, loc };
  }
  const getLoc = (p) => {
    return {
      line: p.lexer.lineno,
      column: p.lexer.colmap[p.lexer.lexpos]
    };
  };
  function p_Struct(p) {
    const name = p.expect("ID", "struct name");
    const st = new NStruct(name, getLoc(p));
    let tok = p.peeknext();
    if (tok && tok.type === "ID" && tok.value === "id") {
      p.next();
      p.expect("EQUALS");
      st.id = parseInt(p.expect("NUM"), 10);
    }
    p.expect("OPEN");
    while (true) {
      if (p.at_end()) {
        p.error(void 0);
      } else if (p.optional("CLOSE")) {
        break;
      } else {
        st.fields.push(p_Field(p));
      }
    }
    return st;
  }
  parserInst.start = p_Struct;
  return parserInst;
}
var struct_parse = StructParser();

// src/struct_typesystem.ts
var struct_typesystem_exports = {};

// src/struct_binpack.ts
var struct_binpack_exports = {};
__export(struct_binpack_exports, {
  BinWriter: () => BinWriter,
  STRUCT_ENDIAN: () => STRUCT_ENDIAN,
  decode_utf8: () => decode_utf8,
  encode_utf8: () => encode_utf8,
  pack_byte: () => pack_byte,
  pack_bytes: () => pack_bytes,
  pack_double: () => pack_double,
  pack_float: () => pack_float,
  pack_int: () => pack_int,
  pack_sbyte: () => pack_sbyte,
  pack_short: () => pack_short,
  pack_static_string: () => pack_static_string,
  pack_string: () => pack_string,
  pack_uint: () => pack_uint,
  pack_ushort: () => pack_ushort,
  setBinaryEndian: () => setBinaryEndian,
  temp_dataview: () => temp_dataview,
  test_utf8: () => test_utf8,
  uint8_view: () => uint8_view,
  unpack_byte: () => unpack_byte,
  unpack_bytes: () => unpack_bytes,
  unpack_context: () => unpack_context,
  unpack_double: () => unpack_double,
  unpack_float: () => unpack_float,
  unpack_int: () => unpack_int,
  unpack_sbyte: () => unpack_sbyte,
  unpack_short: () => unpack_short,
  unpack_static_string: () => unpack_static_string,
  unpack_string: () => unpack_string,
  unpack_uint: () => unpack_uint,
  unpack_ushort: () => unpack_ushort
});
var STRUCT_ENDIAN = true;
function setBinaryEndian(mode) {
  STRUCT_ENDIAN = !!mode;
}
var temp_dataview = new DataView(new ArrayBuffer(16));
var uint8_view = new Uint8Array(temp_dataview.buffer);
var unpack_context = class {
  constructor(version = 0) {
    this.i = 0;
    this.version = version;
  }
};
var BinWriter = class {
  constructor(initialCapacity = 4096) {
    this._isBinWriter = true;
    this.length = 0;
    this.buf = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buf.buffer);
  }
  ensure(n) {
    const need = this.length + n;
    if (need > this.buf.length) {
      let cap = this.buf.length * 2;
      while (cap < need) {
        cap *= 2;
      }
      const nb = new Uint8Array(cap);
      nb.set(this.buf);
      this.buf = nb;
      this.view = new DataView(nb.buffer);
    }
  }
  push(v) {
    this.ensure(1);
    this.buf[this.length++] = v;
  }
  pushBytes(bytes) {
    const n = bytes.length;
    this.ensure(n);
    this.buf.set(bytes, this.length);
    this.length += n;
  }
  i16(v) {
    this.ensure(2);
    this.view.setInt16(this.length, v, STRUCT_ENDIAN);
    this.length += 2;
  }
  u16(v) {
    this.ensure(2);
    this.view.setUint16(this.length, v, STRUCT_ENDIAN);
    this.length += 2;
  }
  i32(v) {
    this.ensure(4);
    this.view.setInt32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }
  u32(v) {
    this.ensure(4);
    this.view.setUint32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }
  f32(v) {
    this.ensure(4);
    this.view.setFloat32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }
  f64(v) {
    this.ensure(8);
    this.view.setFloat64(this.length, v, STRUCT_ENDIAN);
    this.length += 8;
  }
  /** Reserve n bytes (zero-filled) and return their offset, for back-patching. */
  reserve(n) {
    this.ensure(n);
    const off = this.length;
    this.buf.fill(0, off, off + n);
    this.length += n;
    return off;
  }
  patchI32(offset, v) {
    this.view.setInt32(offset, v, STRUCT_ENDIAN);
  }
  /** Used bytes as a view over the internal buffer (no copy). */
  finish() {
    return this.buf.subarray(0, this.length);
  }
  /** Used bytes as an exact-size copy (safe to grab .buffer of). */
  toBytes() {
    return this.buf.slice(0, this.length);
  }
};
function pack_byte(array, val) {
  array.push(val);
}
function pack_sbyte(array, val) {
  if (val < 0) {
    val = 256 + val;
  }
  array.push(val);
}
function pack_bytes(array, bytes) {
  if (array._isBinWriter) {
    array.pushBytes(bytes);
    return;
  }
  for (let i = 0; i < bytes.length; i++) {
    array.push(bytes[i]);
  }
}
function pack_int(array, val) {
  if (array._isBinWriter) {
    array.i32(val);
    return;
  }
  temp_dataview.setInt32(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}
function pack_uint(array, val) {
  if (array._isBinWriter) {
    array.u32(val);
    return;
  }
  temp_dataview.setUint32(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}
function pack_ushort(array, val) {
  if (array._isBinWriter) {
    array.u16(val);
    return;
  }
  temp_dataview.setUint16(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}
function pack_float(array, val) {
  if (array._isBinWriter) {
    array.f32(val);
    return;
  }
  temp_dataview.setFloat32(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}
function pack_double(array, val) {
  if (array._isBinWriter) {
    array.f64(val);
    return;
  }
  temp_dataview.setFloat64(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
  array.push(uint8_view[4]);
  array.push(uint8_view[5]);
  array.push(uint8_view[6]);
  array.push(uint8_view[7]);
}
function pack_short(array, val) {
  if (array._isBinWriter) {
    array.i16(val);
    return;
  }
  temp_dataview.setInt16(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}
function encode_utf8(arr, str) {
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    while (c !== 0) {
      let uc = c & 127;
      c = c >> 7;
      if (c !== 0) uc |= 128;
      arr.push(uc);
    }
  }
}
function decode_utf8(arr) {
  let str = "";
  let i = 0;
  while (i < arr.length) {
    let c = arr[i];
    let sum = c & 127;
    let j = 0;
    while (i < arr.length && c & 128) {
      j += 7;
      i++;
      c = arr[i];
      c = (c & 127) << j;
      sum |= c;
    }
    if (sum === 0) break;
    str += String.fromCharCode(sum);
    i++;
  }
  return str;
}
function test_utf8() {
  const s = "a" + String.fromCharCode(8800) + "b";
  const arr = [];
  encode_utf8(arr, s);
  const s2 = decode_utf8(arr);
  if (s !== s2) {
    throw new Error("UTF-8 encoding/decoding test failed");
  }
  return true;
}
function truncate_utf8(arr, maxlen) {
  const len = Math.min(arr.length, maxlen);
  let last_codepoint = 0;
  let last2 = 0;
  let incode;
  let i = 0;
  while (i < len) {
    incode = arr[i] & 128;
    if (!incode) {
      last2 = last_codepoint + 1;
      last_codepoint = i + 1;
    }
    i++;
  }
  if (last_codepoint < maxlen) arr.length = last_codepoint;
  else arr.length = last2;
  return arr;
}
var _static_sbuf_ss = new Array(2048);
function pack_static_string(data, str, length) {
  if (length === void 0) throw new Error("'length' parameter is not optional for pack_static_string()");
  const arr = length < 2048 ? _static_sbuf_ss : new Array();
  arr.length = 0;
  encode_utf8(arr, str);
  truncate_utf8(arr, length);
  for (let i = arr.length; i < length; i++) {
    arr.push(0);
  }
  arr.length = length;
  pack_bytes(data, arr);
}
var _static_sbuf = new Array(32);
function pack_string(data, str) {
  _static_sbuf.length = 0;
  encode_utf8(_static_sbuf, str);
  pack_int(data, _static_sbuf.length);
  pack_bytes(data, _static_sbuf);
}
function unpack_bytes(dview, uctx, len) {
  const ret = new DataView(dview.buffer.slice(uctx.i, uctx.i + len));
  uctx.i += len;
  return ret;
}
function unpack_byte(dview, uctx) {
  return dview.getUint8(uctx.i++);
}
function unpack_sbyte(dview, uctx) {
  return dview.getInt8(uctx.i++);
}
function unpack_int(dview, uctx) {
  uctx.i += 4;
  return dview.getInt32(uctx.i - 4, STRUCT_ENDIAN);
}
function unpack_uint(dview, uctx) {
  uctx.i += 4;
  return dview.getUint32(uctx.i - 4, STRUCT_ENDIAN);
}
function unpack_ushort(dview, uctx) {
  uctx.i += 2;
  return dview.getUint16(uctx.i - 2, STRUCT_ENDIAN);
}
function unpack_float(dview, uctx) {
  uctx.i += 4;
  return dview.getFloat32(uctx.i - 4, STRUCT_ENDIAN);
}
function unpack_double(dview, uctx) {
  uctx.i += 8;
  return dview.getFloat64(uctx.i - 8, STRUCT_ENDIAN);
}
function unpack_short(dview, uctx) {
  uctx.i += 2;
  return dview.getInt16(uctx.i - 2, STRUCT_ENDIAN);
}
var _static_arr_us = new Array(32);
function unpack_string(data, uctx) {
  const slen = unpack_int(data, uctx);
  if (!slen) {
    return "";
  }
  const arr = slen < 2048 ? _static_arr_us : new Array(slen);
  arr.length = slen;
  const p = uctx.i;
  for (let i = 0; i < slen; i++) {
    arr[i] = data.getUint8(p + i);
  }
  uctx.i += slen;
  return decode_utf8(arr);
}
var _static_arr_uss = new Array(2048);
function unpack_static_string(data, uctx, length) {
  if (length === void 0) throw new Error("'length' cannot be undefined in unpack_static_string()");
  const arr = length < 2048 ? _static_arr_uss : new Array(length);
  arr.length = 0;
  const p = uctx.i;
  let done = false;
  for (let i = 0; i < length; i++) {
    const c = data.getUint8(p + i);
    if (c === 0) {
      done = true;
    }
    if (!done && c !== 0) {
      arr.push(c);
    }
  }
  uctx.i += length;
  truncate_utf8(arr, length);
  return decode_utf8(arr);
}

// src/struct_filehelper.ts
var struct_filehelper_exports = {};
__export(struct_filehelper_exports, {
  Block: () => Block,
  FileError: () => FileError,
  FileHelper: () => FileHelper,
  FileParams: () => FileParams,
  versionCoerce: () => versionCoerce,
  versionLessThan: () => versionLessThan,
  versionToInt: () => versionToInt
});

// src/struct_intern2.ts
var struct_intern2_exports = {};
__export(struct_intern2_exports, {
  StructFieldType: () => StructFieldType,
  StructFieldTypeMap: () => StructFieldTypeMap,
  StructFieldTypes: () => StructFieldTypes,
  _get_pack_debug: () => _get_pack_debug,
  do_pack: () => do_pack,
  formatArrayJson: () => formatArrayJson,
  formatJSON: () => formatJSON,
  fromJSON: () => fromJSON,
  packNull: () => packNull,
  setDebugMode2: () => setDebugMode2,
  setWarningMode2: () => setWarningMode2,
  toJSON: () => toJSON,
  validateJSON: () => validateJSON
});
var warninglvl = 2;
var debug = 0;
var _static_envcode_null = "";
var packer_debug;
var packer_debug_start;
var packer_debug_end;
var packdebug_tablevel = 0;
function _get_pack_debug() {
  return {
    packer_debug,
    packer_debug_start,
    packer_debug_end,
    debug,
    warninglvl
  };
}
var cachering = class _cachering extends Array {
  constructor(cb, tot) {
    super();
    this.length = tot;
    this.cur = 0;
    for (let i = 0; i < tot; i++) {
      this[i] = cb();
    }
  }
  static fromConstructor(cls, tot) {
    return new _cachering(() => new cls(), tot);
  }
  next() {
    let ret = this[this.cur];
    this.cur = (this.cur + 1) % this.length;
    return ret;
  }
};
function gen_tabstr2(tot) {
  let ret = "";
  for (let i = 0; i < tot; i++) {
    ret += " ";
  }
  return ret;
}
function setWarningMode2(t) {
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }
  warninglvl = t;
}
function setDebugMode2(t) {
  debug = t;
  if (debug) {
    packer_debug = function(...args) {
      let tab2 = gen_tabstr2(packdebug_tablevel);
      if (args.length > 0) {
        console.warn(tab2, ...args);
      } else {
        console.warn("Warning: undefined msg");
      }
    };
    packer_debug_start = function(funcname) {
      packer_debug("Start " + funcname);
      packdebug_tablevel++;
    };
    packer_debug_end = function(funcname) {
      packdebug_tablevel--;
      if (funcname) {
        packer_debug("Leave " + funcname);
      }
    };
  } else {
    packer_debug = function(..._args) {
    };
    packer_debug_start = function(..._args) {
    };
    packer_debug_end = function(..._args) {
    };
  }
}
setDebugMode2(debug);
var StructFieldTypes = [];
var StructFieldTypeMap = {};
function packNull(manager2, data, field, type) {
  StructFieldTypeMap[type.type].packNull(manager2, data, field, type);
}
function toJSON(manager2, val, obj, field, type) {
  return StructFieldTypeMap[type.type].toJSON(manager2, val, obj, field, type);
}
function fromJSON(manager2, val, obj, field, type, instance) {
  return StructFieldTypeMap[type.type].fromJSON(manager2, val, obj, field, type, instance);
}
function formatJSON(manager2, val, obj, field, type, instance, tlvl = 0) {
  return StructFieldTypeMap[type.type].formatJSON(manager2, val, obj, field, type, instance, tlvl);
}
function validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
  return StructFieldTypeMap[type.type].validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
}
function unpack_field(manager2, data, type, uctx) {
  let name;
  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("R " + name);
  }
  let ret = StructFieldTypeMap[type.type].unpack(manager2, data, type, uctx);
  if (debug) {
    packer_debug_end();
  }
  return ret;
}
var fakeFields = new cachering(() => {
  return { type: void 0, get: void 0 };
}, 256);
function unpackPrimitiveBulk(data, etype, len, uctx, arr) {
  let p = uctx.i;
  switch (etype) {
    case StructEnum.BYTE:
      for (let i = 0; i < len; i++) arr[i] = data.getUint8(p + i);
      p += len;
      break;
    case StructEnum.SIGNED_BYTE:
      for (let i = 0; i < len; i++) arr[i] = data.getInt8(p + i);
      p += len;
      break;
    case StructEnum.BOOL:
      for (let i = 0; i < len; i++) arr[i] = !!data.getUint8(p + i);
      p += len;
      break;
    case StructEnum.SHORT:
      for (let i = 0; i < len; i++, p += 2) arr[i] = data.getInt16(p, STRUCT_ENDIAN);
      break;
    case StructEnum.USHORT:
      for (let i = 0; i < len; i++, p += 2) arr[i] = data.getUint16(p, STRUCT_ENDIAN);
      break;
    case StructEnum.INT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getInt32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.UINT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getUint32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.FLOAT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getFloat32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.DOUBLE:
      for (let i = 0; i < len; i++, p += 8) arr[i] = data.getFloat64(p, STRUCT_ENDIAN);
      break;
    default:
      return false;
  }
  uctx.i = p;
  return true;
}
function packPrimitiveBulk(data, etype, arr, n = arr.length) {
  switch (etype) {
    case StructEnum.BYTE:
      if (data._isBinWriter && n === arr.length) {
        data.pushBytes(arr);
      } else {
        for (let i = 0; i < n; i++) pack_byte(data, arr[i]);
      }
      break;
    case StructEnum.SIGNED_BYTE:
      for (let i = 0; i < n; i++) pack_sbyte(data, arr[i]);
      break;
    case StructEnum.BOOL:
      for (let i = 0; i < n; i++) pack_byte(data, arr[i] ? 1 : 0);
      break;
    case StructEnum.SHORT:
      for (let i = 0; i < n; i++) pack_short(data, arr[i]);
      break;
    case StructEnum.USHORT:
      for (let i = 0; i < n; i++) pack_ushort(data, arr[i]);
      break;
    case StructEnum.INT:
      for (let i = 0; i < n; i++) pack_int(data, arr[i]);
      break;
    case StructEnum.UINT:
      for (let i = 0; i < n; i++) pack_uint(data, arr[i]);
      break;
    case StructEnum.FLOAT:
      for (let i = 0; i < n; i++) pack_float(data, arr[i]);
      break;
    case StructEnum.DOUBLE:
      for (let i = 0; i < n; i++) pack_double(data, arr[i]);
      break;
    default:
      return false;
  }
  return true;
}
function isBulkArray(val) {
  return Array.isArray(val) || ArrayBuffer.isView(val) && !(val instanceof DataView);
}
function unpackByteTyped(data, etype, len, uctx) {
  if (etype !== StructEnum.BYTE && etype !== StructEnum.SIGNED_BYTE) {
    return null;
  }
  const abs = data.byteOffset + uctx.i;
  const slice = data.buffer.slice(abs, abs + len);
  uctx.i += len;
  return etype === StructEnum.BYTE ? new Uint8Array(slice) : new Int8Array(slice);
}
function fmt_type(type) {
  return StructFieldTypeMap[type.type].format(type);
}
function do_pack(manager2, data, val, obj, field, type) {
  let name;
  if (debug) {
    name = StructFieldTypeMap[type.type !== void 0 ? type.type : type].define().name;
    packer_debug_start("W " + name);
  }
  let typeid;
  if (typeof type !== "number") {
    typeid = type.type;
  } else {
    typeid = type;
  }
  let ret = StructFieldTypeMap[typeid].pack(manager2, data, val, obj, field, type);
  if (debug) {
    packer_debug_end();
  }
  return ret;
}
var _ws_env = [["", void 0]];
var StructFieldType = class _StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
  }
  static unpack(_manager, _data, _type, _uctx) {
    return void 0;
  }
  static packNull(manager2, data, field, type) {
    this.pack(manager2, data, 0, 0, field, type);
  }
  static format(type) {
    return this.define().name;
  }
  static toJSON(manager2, val, obj, field, type) {
    return val;
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return val;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return JSON.stringify(val);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return { ok: true };
  }
  /**
   return false to override default
   helper js for packing
   */
  static useHelperJS(field) {
    return true;
  }
  /**
     Define field class info.
  
     Example:
     <pre>
     static define() {return {
      type : StructEnum.INT,
      name : "int"
    }}
     </pre>
     */
  static define() {
    return {
      type: -1,
      name: "(error)"
    };
  }
  /**
   Register field packer/unpacker class.  Will throw an error if define() method is bad.
   */
  static register(cls) {
    if (StructFieldTypes.indexOf(cls) >= 0) {
      throw new Error("class already registered");
    }
    if (cls.define === _StructFieldType.define) {
      throw new Error("you forgot to make a define() static method");
    }
    if (cls.define().type === void 0) {
      throw new Error("cls.define().type was undefined!");
    }
    if (cls.define().type in StructFieldTypeMap) {
      throw new Error("type " + cls.define().type + " is used by another StructFieldType subclass");
    }
    StructFieldTypes.push(cls);
    StructFieldTypeMap[cls.define().type] = cls;
  }
};
var StructIntField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_int(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_int(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.INT,
      name: "int"
    };
  }
};
StructFieldType.register(StructIntField);
var StructFloatField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_float(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_float(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number") {
      return { ok: "Not a float: " + val, tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.FLOAT,
      name: "float"
    };
  }
};
StructFieldType.register(StructFloatField);
var StructDoubleField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_double(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_double(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number") {
      return { ok: "Not a double: " + val, tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.DOUBLE,
      name: "double"
    };
  }
};
StructFieldType.register(StructDoubleField);
var StructStringField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const s = !val ? "" : val;
    pack_string(data, s);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "string") {
      return { ok: "Not a string: " + val, tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static packNull(manager2, data, field, type) {
    this.pack(manager2, data, "", 0, field, type);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_string(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.STRING,
      name: "string"
    };
  }
};
StructFieldType.register(StructStringField);
var StructStaticStringField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const s = !val ? "" : val;
    pack_static_string(data, s, type.data.maxlength);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "string") {
      return { ok: "Not a string: " + val, tokInfo: getTokInfo(obj) };
    }
    if (val.length > type.data.maxlength) {
      return {
        ok: "String is too big; limit is " + type.data.maxlength + "; string:" + val,
        tokInfo: getTokInfo(obj)
      };
    }
    return { ok: true };
  }
  static format(type) {
    return `static_string[${type.data.maxlength}]`;
  }
  static packNull(manager2, data, field, type) {
    this.pack(manager2, data, "", 0, field, type);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_static_string(data, uctx, type.data.maxlength);
  }
  static define() {
    return {
      type: StructEnum.STATIC_STRING,
      name: "static_string"
    };
  }
};
StructFieldType.register(StructStaticStringField);
var StructStructField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    let stt;
    if (manager2.onSerializeUnknown) {
      const overrideName = manager2.onSerializeUnknown(val);
      if (overrideName !== void 0) {
        stt = manager2.get_struct(overrideName);
      }
    }
    if (stt === void 0) {
      stt = manager2.get_struct(type.data);
    }
    packer_debug("struct", stt.name);
    manager2.write_struct(data, val, stt);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    let stt = manager2.get_struct(type.data);
    if (!val) {
      return { ok: "Expected " + stt.name + " object", tokInfo: getTokInfo(obj) };
    }
    return manager2.validateJSONIntern(val, stt, _abstractKey);
  }
  static format(type) {
    return type.data;
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    let stt = manager2.get_struct(type.data);
    return manager2.readJSON(val, stt, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    let stt = manager2.get_struct(type.data);
    return manager2.formatJSON_intern(val, stt, field, tlvl);
  }
  static toJSON(manager2, val, obj, field, type) {
    let stt = manager2.get_struct(type.data);
    return manager2.writeJSON(val, stt);
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let cls2 = manager2.get_struct_cls(type.data);
    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager2.read_object(data, cls2, uctx, dest);
  }
  static packNull(manager2, data, field, type) {
    let stt = manager2.get_struct(type.data);
    packer_debug("struct", type);
    for (let field2 of stt.fields) {
      let type2 = field2.type;
      packNull(manager2, data, field2, type2);
    }
  }
  static unpack(manager2, data, type, uctx) {
    let cls2 = manager2.get_struct_cls(type.data);
    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager2.read_object(data, cls2, uctx);
  }
  static define() {
    return {
      type: StructEnum.STRUCT,
      name: "struct"
    };
  }
};
StructFieldType.register(StructStructField);
var StructTStructField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    let cls = manager2.get_struct_cls(type.data);
    let stt = manager2.get_struct(type.data);
    const keywords = manager2.constructor.keywords;
    if (manager2.onSerializeUnknown) {
      const overrideName = manager2.onSerializeUnknown(val);
      if (overrideName !== void 0) {
        const ostt = manager2.get_struct(overrideName);
        if (debug) packer_debug("int " + ostt.id);
        pack_int(data, ostt.id);
        manager2.write_struct(data, val, ostt);
        return;
      }
    }
    const valObj = val;
    const valCtor = valObj.constructor;
    if (valCtor[keywords.name] !== type.data && val instanceof cls) {
      stt = manager2.get_struct(valCtor[keywords.name]);
    } else if (valCtor[keywords.name] === type.data) {
      stt = manager2.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct " + valCtor[keywords.name] + " passed to write_struct");
    }
    if (debug) packer_debug("int " + stt.id);
    pack_int(data, stt.id);
    manager2.write_struct(data, val, stt);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    let key = type.jsonKeyword;
    if (typeof val !== "object") {
      return { ok: typeof val + " is not an object", tokInfo: getTokInfo(obj) };
    }
    const valObj = val;
    let stt = manager2.get_struct(valObj[key]);
    let cls = manager2.get_struct_cls(stt.name);
    let parentcls = manager2.get_struct_cls(type.data);
    let ok = false;
    do {
      if (cls === parentcls) {
        ok = true;
        break;
      }
      cls = cls.prototype.__proto__.constructor;
    } while (cls && cls !== Object);
    if (!ok) {
      return { ok: stt.name + " is not a child class off " + type.data, tokInfo: getTokInfo(obj) };
    }
    return manager2.validateJSONIntern(valObj, stt, type.jsonKeyword);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    let key = type.jsonKeyword;
    const valObj = val;
    let stt = manager2.get_struct(valObj[key]);
    return manager2.readJSON(val, stt, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    let key = type.jsonKeyword;
    const valObj = val;
    let stt = manager2.get_struct(valObj[key]);
    return manager2.formatJSON_intern(valObj, stt, field, tlvl);
  }
  static toJSON(manager2, val, obj, field, type) {
    const keywords = manager2.constructor.keywords;
    const valObj = val;
    const valCtor = valObj.constructor;
    let stt = manager2.get_struct(valCtor[keywords.name]);
    let ret = manager2.writeJSON(val, stt);
    ret[type.jsonKeyword] = "" + stt.name;
    return ret;
  }
  static packNull(manager2, data, field, type) {
    let stt = manager2.get_struct(type.data);
    pack_int(data, stt.id);
    packNull(manager2, data, field, { type: StructEnum.STRUCT, data: type.data });
  }
  static format(type) {
    return "abstract(" + type.data + ")";
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let id = unpack_int(data, uctx);
    if (debug) packer_debug("-int " + id);
    if (!(id in manager2.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager2.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }
    let cls2 = manager2.get_struct_id(id);
    if (debug) packer_debug("struct name: " + cls2.name);
    let cls3 = manager2.struct_cls[cls2.name];
    const missing = cls3 === void 0 || !!manager2.onUnknownClass && isParseStructsDummy(cls3);
    const instance = manager2.read_object(data, missing ? id : cls3, uctx, dest);
    if (missing && instance && typeof instance === "object") {
      instance._origClsname = cls2.name;
    }
    return instance;
  }
  static unpack(manager2, data, type, uctx) {
    let id = unpack_int(data, uctx);
    if (debug) packer_debug("-int " + id);
    if (!(id in manager2.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager2.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }
    let cls2 = manager2.get_struct_id(id);
    if (debug) packer_debug("struct name: " + cls2.name);
    let cls3 = manager2.struct_cls[cls2.name];
    const missing = cls3 === void 0 || !!manager2.onUnknownClass && isParseStructsDummy(cls3);
    const instance = manager2.read_object(data, missing ? id : cls3, uctx);
    if (missing && instance && typeof instance === "object") {
      instance._origClsname = cls2.name;
    }
    return instance;
  }
  static define() {
    return {
      type: StructEnum.TSTRUCT,
      name: "tstruct"
    };
  }
};
StructFieldType.register(StructTStructField);
function formatArrayJson(manager2, val, obj, field, type, type2, instance, tlvl, array = val) {
  if (array === void 0 || array === null || typeof array !== "object" || !(Symbol.iterator in array)) {
    console.log(obj);
    console.log(array);
    throw new Error(`Expected an array for ${field.name}`);
  }
  if (ValueTypes.has(type2.type)) {
    return JSON.stringify(array);
  }
  let s = "[";
  if (manager2.formatCtx.addComments && field.comment.trim()) {
    s += " " + field.comment.trim();
  }
  s += "\n";
  for (let i = 0; i < array.length; i++) {
    let item = array[i];
    s += tab(tlvl + 1) + formatJSON(manager2, item, val, field, type2, instance, tlvl + 1) + ",\n";
  }
  s += tab(tlvl) + "]";
  return s;
}
var StructArrayField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    if (val === void 0) {
      console.trace();
      console.log("Undefined array fed to struct struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      pack_int(data, 0);
      return;
    }
    const arr = val;
    packer_debug("int " + arr.length);
    pack_int(data, arr.length);
    let d = type.data;
    let itername = d.iname;
    let type2 = d.type;
    const useEnv = itername !== "" && itername !== void 0 && field.get;
    if (!debug && !useEnv && packPrimitiveBulk(data, type2.type, arr)) {
      return;
    }
    let env = _ws_env;
    for (let i = 0; i < arr.length; i++) {
      let val2 = arr[i];
      if (useEnv) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager2, data, val2, obj, fakeField, type2);
    }
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static format(type) {
    const d = type.data;
    if (d.iname !== "" && d.iname !== void 0) {
      return "array(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "array(" + fmt_type(d.type) + ")";
    }
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (!val) {
      return { ok: "not an array: " + val, tokInfo: getTokInfo(obj) };
    }
    const arr = val;
    for (let i = 0; i < arr.length; i++) {
      let ret = validateJSON(
        manager2,
        arr[i],
        val,
        field,
        type.data.type,
        void 0,
        _abstractKey
      );
      if (typeof ret.ok === "string" || !ret.ok) {
        return ret;
      }
    }
    return { ok: true };
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    const arr = val;
    let ret = instance || [];
    ret.length = 0;
    for (let i = 0; i < arr.length; i++) {
      let val2 = fromJSON(manager2, arr[i], val, field, type.data.type, void 0);
      if (val2 === void 0) {
        console.log(val2);
        console.error("eeek");
        throw new Error("Unexpected undefined value in fromJSON");
      }
      ret.push(val2);
    }
    return ret;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0
    );
  }
  static toJSON(manager2, val, obj, field, type) {
    const arr = val || [];
    let json = [];
    let itername = type.data.iname;
    for (let i = 0; i < arr.length; i++) {
      let val2 = arr[i];
      let env = _ws_env;
      if (itername !== "" && itername !== void 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      json.push(toJSON(manager2, val2, val, field, type.data.type));
    }
    return json;
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    const arr = dest;
    const t2 = type.data.type;
    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }
    arr.length = 0;
    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager2, data, t2, uctx));
    }
    return arr;
  }
  static unpack(manager2, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const t2 = type.data.type;
    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }
    let arr = new Array(len);
    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager2, data, t2, uctx);
    }
    return arr;
  }
  static define() {
    return {
      type: StructEnum.ARRAY,
      name: "array"
    };
  }
};
StructFieldType.register(StructArrayField);
var StructIterField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    function forEach(cb, thisvar) {
      const v = val;
      if (v && v[Symbol.iterator]) {
        for (const item of v) {
          cb.call(thisvar, item);
        }
      } else if (v && typeof v.forEach === "function") {
        v.forEach(function(item) {
          cb.call(thisvar, item);
        });
      } else {
        console.trace();
        console.log("Undefined iterable list fed to struct struct packer!", val);
        console.log("Field: ", field);
        console.log("Type: ", type);
        console.log("");
      }
    }
    let d = type.data;
    let itername = d.iname;
    let type2 = d.type;
    let env = _ws_env;
    const useEnv = itername !== "" && itername !== void 0 && field.get;
    if (!debug && !useEnv && isBulkArray(val)) {
      const arr = val;
      pack_int(data, arr.length);
      if (packPrimitiveBulk(data, type2.type, arr)) {
        return;
      }
      data.length -= 4;
    }
    let starti;
    if (data._isBinWriter) {
      starti = data.reserve(4);
    } else {
      starti = data.length;
      data.length += 4;
    }
    let i = 0;
    forEach(function(val2) {
      let v2 = val2;
      if (useEnv) {
        env[0][0] = itername;
        env[0][1] = v2;
        v2 = manager2._env_call(field.get, obj, env);
      }
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager2, data, v2, obj, fakeField, type2);
      i++;
    }, void 0);
    if (data._isBinWriter) {
      data.patchI32(starti, i);
    } else {
      temp_dataview.setInt32(0, i, STRUCT_ENDIAN);
      const a = data;
      a[starti++] = uint8_view[0];
      a[starti++] = uint8_view[1];
      a[starti++] = uint8_view[2];
      a[starti++] = uint8_view[3];
    }
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0,
      list(val)
    );
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return StructArrayField.validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return StructArrayField.fromJSON(manager2, val, obj, field, type, instance);
  }
  static toJSON(manager2, val, obj, field, type) {
    const arr = val || [];
    let json = [];
    let itername = type.data.iname;
    for (let val2 of arr) {
      let v2 = val2;
      let env = _ws_env;
      if (itername !== "" && itername !== void 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = v2;
        v2 = manager2._env_call(field.get, obj, env);
      }
      json.push(toJSON(manager2, v2, val, field, type.data.type));
    }
    return json;
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static format(type) {
    const d = type.data;
    if (d.iname !== "" && d.iname !== void 0) {
      return "iter(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "iter(" + fmt_type(d.type) + ")";
    }
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const arr = dest;
    const t2 = type.data.type;
    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }
    arr.length = 0;
    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager2, data, t2, uctx));
    }
    return arr;
  }
  static unpack(manager2, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const t2 = type.data.type;
    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }
    let arr = new Array(len);
    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager2, data, t2, uctx);
    }
    return arr;
  }
  static define() {
    return {
      type: StructEnum.ITER,
      name: "iter"
    };
  }
};
StructFieldType.register(StructIterField);
var StructShortField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_short(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_short(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.SHORT,
      name: "short"
    };
  }
};
StructFieldType.register(StructShortField);
var StructByteField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_byte(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_byte(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.BYTE,
      name: "byte"
    };
  }
};
StructFieldType.register(StructByteField);
var StructSignedByteField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_sbyte(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_sbyte(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.SIGNED_BYTE,
      name: "sbyte"
    };
  }
};
StructFieldType.register(StructSignedByteField);
var StructBoolField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_byte(data, val ? 1 : 0);
  }
  static unpack(manager2, data, type, uctx) {
    return !!unpack_byte(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (val === 0 || val === 1 || val === true || val === false || val === "true" || val === "false") {
      return { ok: true };
    }
    return { ok: "" + val + " is not a bool", tokInfo: getTokInfo(obj) };
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    if (val === "false") {
      return false;
    }
    return !!val;
  }
  static toJSON(manager2, val, obj, field, type) {
    return !!val;
  }
  static define() {
    return {
      type: StructEnum.BOOL,
      name: "bool"
    };
  }
};
StructFieldType.register(StructBoolField);
var StructIterKeysField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    if (typeof val !== "object" && typeof val !== "function" || val === null) {
      console.warn("Bad object fed to iterkeys in struct packer!", val);
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      pack_int(data, 0);
      return;
    }
    const valObj = val;
    let len = 0;
    for (let k in valObj) {
      len++;
    }
    packer_debug("int " + len);
    pack_int(data, len);
    let d = type.data;
    let itername = d.iname;
    let type2 = d.type;
    let env = _ws_env;
    let i = 0;
    for (let key in valObj) {
      if (i >= len) {
        if (warninglvl > 0) {
          console.warn("Warning: object keys magically changed during iteration", val, i);
        }
        return;
      }
      let val2;
      if (itername && itername.trim().length > 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = key;
        val2 = manager2._env_call(field.get, obj, env);
      } else {
        val2 = valObj[key];
      }
      let f2 = { type: type2, get: void 0, name: "", comment: "", loc: { line: 0, column: 0 } };
      do_pack(manager2, data, val2, obj, f2, type2);
      i++;
    }
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return StructArrayField.validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return StructArrayField.fromJSON(manager2, val, obj, field, type, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0,
      list(val)
    );
  }
  static toJSON(manager2, val, obj, field, type) {
    const arr = val || [];
    let json = [];
    let itername = type.data.iname;
    for (let k in arr) {
      let val2 = arr[k];
      let env = _ws_env;
      if (itername !== "" && itername !== void 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      json.push(toJSON(manager2, val2, val, field, type.data.type));
    }
    return json;
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static format(type) {
    const d = type.data;
    if (d.iname !== "" && d.iname !== void 0) {
      return "iterkeys(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "iterkeys(" + fmt_type(d.type) + ")";
    }
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const arr = dest;
    const t2 = type.data.type;
    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }
    arr.length = 0;
    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager2, data, t2, uctx));
    }
    return arr;
  }
  static unpack(manager2, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const t2 = type.data.type;
    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }
    let arr = new Array(len);
    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager2, data, t2, uctx);
    }
    return arr;
  }
  static define() {
    return {
      type: StructEnum.ITERKEYS,
      name: "iterkeys"
    };
  }
};
StructFieldType.register(StructIterKeysField);
var StructUintField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_uint(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_uint(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.UINT,
      name: "uint"
    };
  }
};
StructFieldType.register(StructUintField);
var StructUshortField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_ushort(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_ushort(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.USHORT,
      name: "ushort"
    };
  }
};
StructFieldType.register(StructUshortField);
var StructStaticArrayField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const d = type.data;
    if (d.size === void 0) {
      throw new Error("type.data.size was undefined");
    }
    let itername = d.iname;
    const arr = val;
    if (arr === void 0 || !arr.length) {
      this.packNull(manager2, data, field, type);
      return;
    }
    const useEnv = itername !== "" && itername !== void 0 && field.get;
    if (!debug && !useEnv && arr.length >= d.size && packPrimitiveBulk(data, d.type.type, arr, d.size)) {
      return;
    }
    for (let i = 0; i < d.size; i++) {
      let i2 = Math.min(i, Math.min(arr.length - 1, d.size));
      let val2 = arr[i2];
      if (useEnv) {
        let env = _ws_env;
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      do_pack(manager2, data, val2, val, field, d.type);
    }
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return StructArrayField.validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return StructArrayField.fromJSON(manager2, val, obj, field, type, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0,
      list(val)
    );
  }
  static packNull(manager2, data, field, type) {
    const d = type.data;
    let size = d.size;
    for (let i = 0; i < size; i++) {
      packNull(manager2, data, field, d.type);
    }
  }
  static toJSON(manager2, val, obj, field, type) {
    return StructArrayField.toJSON(manager2, val, obj, field, type);
  }
  static format(type) {
    const d = type.data;
    let type2 = StructFieldTypeMap[d.type.type].format(d.type);
    let ret = `static_array[${type2}, ${d.size}`;
    if (d.iname) {
      ret += `, ${d.iname}`;
    }
    ret += `]`;
    return ret;
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    const d = type.data;
    packer_debug("-size: " + d.size);
    const ret = dest;
    if (!debug) {
      ret.length = d.size;
      if (unpackPrimitiveBulk(data, d.type.type, d.size, uctx, ret)) {
        return ret;
      }
    }
    ret.length = 0;
    for (let i = 0; i < d.size; i++) {
      ret.push(unpack_field(manager2, data, d.type, uctx));
    }
    return ret;
  }
  static unpack(manager2, data, type, uctx) {
    const d = type.data;
    packer_debug("-size: " + d.size);
    if (!debug) {
      const ret2 = new Array(d.size);
      if (unpackPrimitiveBulk(data, d.type.type, d.size, uctx, ret2)) {
        return ret2;
      }
    }
    let ret = [];
    for (let i = 0; i < d.size; i++) {
      ret.push(unpack_field(manager2, data, d.type, uctx));
    }
    return ret;
  }
  static define() {
    return {
      type: StructEnum.STATIC_ARRAY,
      name: "static_array"
    };
  }
};
StructFieldType.register(StructStaticArrayField);
var StructOptionalField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_int(data, val !== void 0 && val !== null ? 1 : 0);
    if (val !== void 0 && val !== null) {
      const fakeField = { ...field, type: type.data };
      do_pack(manager2, data, val, obj, fakeField, type.data);
    }
  }
  static fakeField(field, type) {
    return { ...field, type: type.data };
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    const fakeField = this.fakeField(field, type);
    return val !== void 0 && val !== null ? validateJSON(manager2, val, obj, fakeField, type.data, void 0, _abstractKey) : { ok: true };
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    const fakeField = this.fakeField(field, type);
    return val !== void 0 && val !== null ? fromJSON(manager2, val, obj, fakeField, type.data, void 0) : void 0;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    if (val !== void 0 && val !== null) {
      const fakeField = this.fakeField(field, type);
      return formatJSON(manager2, val, val, fakeField, type.data, instance, (tlvl ?? 0) + 1);
    }
    return "null";
  }
  static toJSON(manager2, val, obj, field, type) {
    const fakeField = this.fakeField(field, type);
    return val !== void 0 && val !== null ? toJSON(manager2, val, obj, fakeField, type.data) : null;
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static format(type) {
    return "optional(" + fmt_type(type.data) + ")";
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let exists = unpack_int(data, uctx);
    packer_debug("optional exists: " + exists);
    if (!exists) {
      return;
    }
    return unpack_field(manager2, data, type.data, uctx);
  }
  static unpack(manager2, data, type, uctx) {
    let exists = unpack_int(data, uctx);
    if (!exists) {
      return void 0;
    }
    return unpack_field(manager2, data, type.data, uctx);
  }
  static define() {
    return {
      type: StructEnum.OPTIONAL,
      name: "optional"
    };
  }
};
StructFieldType.register(StructOptionalField);
var arrayBufferElemTypes = {
  byte: { ctor: Uint8Array, size: 1 },
  sbyte: { ctor: Int8Array, size: 1 },
  short: { ctor: Int16Array, size: 2 },
  ushort: { ctor: Uint16Array, size: 2 },
  int: { ctor: Int32Array, size: 4 },
  uint: { ctor: Uint32Array, size: 4 },
  float: { ctor: Float32Array, size: 4 },
  double: { ctor: Float64Array, size: 8 }
};
var PLATFORM_LITTLE_ENDIAN = new Uint8Array(Uint32Array.of(1).buffer)[0] === 1;
function arrayBufferElem(type) {
  const name = type.data.type;
  const elem = arrayBufferElemTypes[name];
  if (!elem) {
    throw new Error("invalid arraybuffer element type " + name);
  }
  return elem;
}
function byteswapElems(bytes, elemSize) {
  if (elemSize <= 1) {
    return;
  }
  for (let i = 0; i < bytes.length; i += elemSize) {
    for (let a = i, b = i + elemSize - 1; a < b; a++, b--) {
      const t = bytes[a];
      bytes[a] = bytes[b];
      bytes[b] = t;
    }
  }
}
function toElemTyped(val, elem) {
  if (val instanceof elem.ctor) {
    return val;
  }
  if (val instanceof ArrayBuffer) {
    return new elem.ctor(val, 0, val.byteLength / elem.size | 0);
  }
  if (ArrayBuffer.isView(val)) {
    const v = val;
    return new elem.ctor(v.buffer, v.byteOffset, v.byteLength / elem.size | 0);
  }
  if (Array.isArray(val)) {
    const ta = new elem.ctor(val.length);
    ta.set(val);
    return ta;
  }
  throw new Error("arraybuffer field expects an ArrayBuffer, typed array, DataView, or number[]");
}
var StructArrayBufferField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const elem = arrayBufferElem(type);
    if (val === void 0 || val === null) {
      pack_int(data, 0);
      return;
    }
    const view = toElemTyped(val, elem);
    let bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    pack_int(data, bytes.byteLength);
    if (elem.size > 1 && STRUCT_ENDIAN !== PLATFORM_LITTLE_ENDIAN) {
      bytes = bytes.slice();
      byteswapElems(bytes, elem.size);
    }
    pack_bytes(data, bytes);
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static unpack(manager2, data, type, uctx) {
    const elem = arrayBufferElem(type);
    const byteLength = unpack_int(data, uctx);
    packer_debug("-arraybuffer bytes " + byteLength);
    const abs = data.byteOffset + uctx.i;
    const slice = data.buffer.slice(abs, abs + byteLength);
    uctx.i += byteLength;
    if (elem.size > 1 && STRUCT_ENDIAN !== PLATFORM_LITTLE_ENDIAN) {
      byteswapElems(new Uint8Array(slice), elem.size);
    }
    return new elem.ctor(slice, 0, byteLength / elem.size | 0);
  }
  static toJSON(manager2, val, obj, field, type) {
    if (val === void 0 || val === null) {
      return [];
    }
    return Array.from(toElemTyped(val, arrayBufferElem(type)));
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    const elem = arrayBufferElem(type);
    const arr = val || [];
    const ta = new elem.ctor(arr.length);
    ta.set(arr);
    return ta;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    const arr = Array.isArray(val) ? val : Array.from(toElemTyped(val, arrayBufferElem(type)));
    return JSON.stringify(arr);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (!Array.isArray(val)) {
      return { ok: "not an array: " + val, tokInfo: getTokInfo(obj) };
    }
    for (let i = 0; i < val.length; i++) {
      if (typeof val[i] !== "number") {
        return { ok: "non-numeric arraybuffer element: " + val[i], tokInfo: getTokInfo(obj) };
      }
    }
    return { ok: true };
  }
  static format(type) {
    return "arraybuffer(" + type.data.type + ")";
  }
  static define() {
    return {
      type: StructEnum.ARRAYBUFFER,
      name: "arraybuffer"
    };
  }
};
StructFieldType.register(StructArrayBufferField);

// src/struct_eval.ts
var struct_eval_exports = {};
__export(struct_eval_exports, {
  setStructEval: () => setStructEval,
  structEval: () => structEval
});
var structEval = eval;
function setStructEval(val) {
  structEval = val;
}

// src/struct_json.ts
function buildJSONParser() {
  const tk = (name, re, func, example) => new tokdef(name, re, func, example);
  let parse;
  const nint = "[+-]?[0-9]+";
  const nhex = "[+-]?0x[0-9a-fA-F]+";
  const nfloat1 = "[+-]?[0-9]+\\.[0-9]*";
  const nfloat2 = "[+-]?[0-9]*\\.[0-9]+";
  let nfloatexp = "[+-]?[0-9]+\\.[0-9]+[eE][+-]?[0-9]+";
  const nfloat = `(${nfloat1})|(${nfloat2})|(${nfloatexp})`;
  const num = `(${nint})|(${nfloat})|(${nhex})`;
  const numre = new RegExp(num);
  const numreTest = new RegExp(`(${num})$`);
  let nfloat3 = new RegExp("[+-]?[0-9]+\\.[0-9]+");
  nfloatexp = new RegExp(nfloatexp);
  const tests = ["1.234234", ".23432", "-234.", "1e-17", "-0x23423ff", "+23423", "-4.263256414560601e-14"];
  for (const test2 of tests) {
    if (!numreTest.test(test2)) {
      console.error("Error! Number regexp failed:", test2);
    }
  }
  const tokens = [
    tk("BOOL", /true|false/),
    tk("WS", /[ \r\t\n]/, (_t) => void 0),
    //drop token
    tk("STRLIT", /["']/, (t) => {
      const lex2 = t.lexer;
      const char = t.value;
      let i = lex2.lexpos;
      const lexdata = lex2.lexdata;
      let escape = false;
      t.value = "";
      while (i < lexdata.length) {
        const c = lexdata[i];
        t.value += c;
        if (c === "\\") {
          escape = !escape;
        } else if (!escape && c === char) {
          break;
        } else {
          escape = false;
        }
        i++;
      }
      lex2.lexpos = i + 1;
      if (t.value.length > 0) {
        t.value = t.value.slice(0, t.value.length - 1);
      }
      return t;
    }),
    tk("LSBRACKET", /\[/),
    tk("RSBRACKET", /]/),
    tk("LBRACE", /{/),
    tk("RBRACE", /}/),
    tk("NULL", /null/),
    tk("COMMA", /,/),
    tk("COLON", /:/),
    tk("NUM", numre, (t) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
    tk("NUM", nfloat3, (t) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
    tk("NUM", nfloatexp, (t) => {
      t.value = "" + parseFloat(t.value);
      return t;
    })
  ];
  function tokinfo(t) {
    return {
      lexpos: t ? t.lexpos : 0,
      lineno: t ? t.lineno : 0,
      col: t ? t.col : 0,
      fields: {}
    };
  }
  function p_Array(p) {
    p.expect("LSBRACKET");
    let t = p.peeknext();
    let first = true;
    const ret = [];
    setTokInfo(ret, tokinfo(t));
    while (t && t.type !== "RSBRACKET") {
      if (!first) {
        p.expect("COMMA");
      }
      getTokInfo(ret).fields[ret.length] = tokinfo(t);
      ret.push(p_Start(p));
      first = false;
      t = p.peeknext();
    }
    p.expect("RSBRACKET");
    return ret;
  }
  function p_Object(p) {
    p.expect("LBRACE");
    const obj = {};
    let first = true;
    let t = p.peeknext();
    setTokInfo(obj, tokinfo(t));
    while (t && t.type !== "RBRACE") {
      if (!first) {
        p.expect("COMMA");
      }
      const key = p.expect("STRLIT");
      p.expect("COLON");
      const val = p_Start(p, true);
      obj[key] = val;
      first = false;
      t = p.peeknext();
      getTokInfo(obj).fields[key] = tokinfo(t);
    }
    p.expect("RBRACE");
    return obj;
  }
  function p_Start(p, _throwError = true) {
    const t = p.peeknext();
    if (!t) {
      p.error(void 0, "Unexpected end of input");
    }
    if (t.type === "LSBRACKET") {
      return p_Array(p);
    } else if (t.type === "LBRACE") {
      return p_Object(p);
    } else if (t.type === "STRLIT" || t.type === "NUM" || t.type === "NULL" || t.type === "BOOL") {
      const tok = p.next();
      if (tok.type === "NUM") {
        return parseFloat(tok.value);
      } else if (tok.type === "BOOL") {
        return tok.value === "true";
      } else if (tok.type === "NULL") {
        return null;
      }
      return tok.value;
    } else {
      p.error(t, "Unknown token");
    }
  }
  function p_Error(_token, _msg) {
    throw new PUTIL_ParseError("Parse Error");
  }
  const lex = new lexer(tokens);
  lex.linestart = 0;
  parse = new parser(lex, p_Error);
  parse.start = p_Start;
  return parse;
}
var _defaultParser = buildJSONParser();
var struct_json_default = _defaultParser;
function printContext(buf, tokinfo, printColors = true) {
  const lines = buf.split("\n");
  if (!tokinfo) {
    return "";
  }
  const lineno = tokinfo.lineno;
  const col = tokinfo.col;
  const istart = Math.max(lineno - 25, 0);
  const iend = Math.min(lineno + 50, lines.length - 1);
  let s = "";
  if (printColors) {
    s += termColor("  /* pretty-printed json */\n", "blue");
  } else {
    s += "/* pretty-printed json */\n";
  }
  for (let i = istart; i < iend; i++) {
    const l = lines[i];
    let idx = "" + i;
    while (idx.length < 3) {
      idx = " " + idx;
    }
    if (i === lineno && printColors) {
      s += termColor(`${idx}: ${l}
`, "yellow");
    } else {
      s += `${idx}: ${l}
`;
    }
    if (i === lineno) {
      let l2 = "";
      for (let j = 0; j < col + 5; j++) {
        l2 += " ";
      }
      s += l2 + "^\n";
    }
  }
  s += `
    at line ${tokinfo.lineno}:${tokinfo.col}`;
  return s;
}

// src/struct_global.ts
var nGlobal = globalThis;
if (typeof globalThis !== "undefined") {
  nGlobal = globalThis;
} else if (typeof window !== "undefined") {
  nGlobal = window;
} else if (typeof global !== "undefined") {
  nGlobal = global;
} else if (typeof self !== "undefined") {
  nGlobal = self;
}
var DEBUG = {};
function updateDEBUG() {
  for (const k of Object.keys(DEBUG)) {
    delete DEBUG[k];
  }
  const g = nGlobal;
  if (typeof g.DEBUG === "object" && g.DEBUG !== null) {
    const dbg = g.DEBUG;
    for (const k in dbg) {
      DEBUG[k] = dbg[k];
    }
  }
}

// src/struct_intern.ts
var sintern2 = struct_intern2_exports;
var struct_eval = struct_eval_exports;
var warninglvl2 = 2;
var truncateDollarSign = true;
var manager;
var STABLE_ID_BASE = 1048576;
var STABLE_ID_LIMIT = 2147483647;
function stableStructId(name) {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i) & 255;
    hash = Math.imul(hash, 16777619) >>> 0;
    const hi = name.charCodeAt(i) >> 8;
    if (hi !== 0) {
      hash ^= hi;
      hash = Math.imul(hash, 16777619) >>> 0;
    }
  }
  return STABLE_ID_BASE + hash % (STABLE_ID_LIMIT - STABLE_ID_BASE);
}
var JSONError = class extends Error {
};
function printCodeLines(code2) {
  const lines = code2.split(String.fromCharCode(10));
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
function printEvalError(code) {
  console.log("== CODE ==");
  console.log(printCodeLines(code));
  eval(code);
}
function setTruncateDollarSign(v) {
  truncateDollarSign = !!v;
}
function _truncateDollarSign(s) {
  const i = s.search("$");
  if (i > 0) {
    return s.slice(0, i).trim();
  }
  return s;
}
function unmangle(name) {
  if (truncateDollarSign) {
    return _truncateDollarSign(name);
  } else {
    return name;
  }
}
var _static_envcode_null2 = "";
function gen_tabstr3(tot) {
  let ret = "";
  for (let i = 0; i < tot; i++) {
    ret += " ";
  }
  return ret;
}
var packer_debug2;
var packer_debug_start2;
var packer_debug_end2;
function update_debug_data() {
  const ret = _get_pack_debug();
  packer_debug2 = ret.packer_debug;
  packer_debug_start2 = ret.packer_debug_start;
  packer_debug_end2 = ret.packer_debug_end;
  warninglvl2 = ret.warninglvl;
}
update_debug_data();
function setWarningMode(t) {
  sintern2.setWarningMode2(t);
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }
  warninglvl2 = t;
}
function setDebugMode(t) {
  sintern2.setDebugMode2(t);
  update_debug_data();
}
var _ws_env2 = [[void 0, void 0]];
function define_empty_class(scls, name) {
  const cls = function() {
  };
  cls.prototype = Object.create(Object.prototype);
  cls.constructor = cls.prototype.constructor = cls;
  const keywords = scls.keywords;
  cls[keywords.script] = name + " {\n  }\n";
  cls[keywords.name] = name;
  cls.prototype[keywords.load] = function(reader) {
    reader(this);
  };
  cls[keywords.new] = function() {
    return new this();
  };
  return cls;
}
var binaryMigrateFinisher = () => {
};
var STRUCT = class _STRUCT {
  constructor() {
    // always sorted
    this.struct_names_migrations = [];
    this.idgen = 0;
    this.allowOverriding = true;
    this.stableIds = true;
    this.stableIdOverrides = {};
    this.structs = {};
    this.struct_cls = {};
    this.struct_ids = {};
    this.compiled_code = {};
    this.null_natives = {};
    this.define_null_native("Object", Object);
    this.jsonUseColors = true;
    this.jsonBuf = "";
    this.formatCtx = {};
  }
  static inherit(child, parent, structName = child.name) {
    const keywords = this.keywords;
    if (!parent[keywords.script]) {
      return structName + "{\n";
    }
    const stt = struct_parse.parse(parent[keywords.script]);
    let code2 = structName + "{\n";
    code2 += _STRUCT.fmt_struct(stt, true, false, true);
    return code2;
  }
  /** invoke loadSTRUCT methods on parent objects.  note that
   reader() is only called once.  it is called however.*/
  static Super(obj, reader) {
    if (warninglvl2 > 0) {
      console.warn("deprecated");
    }
    reader(obj);
    function reader2(_obj) {
    }
    const cls = obj.constructor;
    const keywords = this.keywords;
    let bad = cls === void 0 || cls.prototype === void 0 || Object.getPrototypeOf(cls.prototype) === void 0;
    if (bad) {
      return;
    }
    const parentProto = Object.getPrototypeOf(cls.prototype);
    const parent = parentProto.constructor;
    bad = bad || parent === void 0;
    if (!bad && parent.prototype[keywords.load] && parent.prototype[keywords.load] !== obj[keywords.load]) {
      parent.prototype[keywords.load].call(obj, reader2);
    }
  }
  /** deprecated.  used with old fromSTRUCT interface. */
  static chain_fromSTRUCT(cls, reader) {
    const keywords = this.keywords;
    if (warninglvl2 > 0) {
      console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");
    }
    const proto = cls.prototype;
    const parent = proto.prototype;
    const obj = parent.constructor[keywords.from];
    const result = obj(reader);
    const obj2 = new cls();
    const keys = Object.keys(result).concat(
      Object.getOwnPropertySymbols(result)
    );
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      try {
        obj2[k] = result[k];
      } catch (error) {
        if (warninglvl2 > 0) {
          console.warn("  failed to set property", k);
        }
      }
    }
    return obj2;
  }
  // defined_classes is an array of class constructors
  // with STRUCT scripts, *OR* another STRUCT instance
  static formatStruct(stt, internal_only, no_helper_js) {
    return this.fmt_struct(stt, internal_only, no_helper_js);
  }
  static fmt_struct(stt, internal_only, no_helper_js, addComments, excludeId) {
    if (internal_only === void 0) internal_only = false;
    if (no_helper_js === void 0) no_helper_js = false;
    let s = "";
    if (!internal_only) {
      s += stt.name;
      if (!excludeId && stt.id !== -1) s += " id=" + stt.id;
      s += " {\n";
    }
    const tab2 = "  ";
    function fmt_type2(type) {
      return StructFieldTypeMap[type.type].format(type);
    }
    const fields = stt.fields;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      s += tab2 + f.name + " : " + fmt_type2(f.type);
      if (!no_helper_js && f.get !== void 0) {
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
  static setClassKeyword(keyword, nameKeyword) {
    if (!nameKeyword) {
      nameKeyword = keyword.toLowerCase() + "Name";
    }
    this.keywords = {
      script: keyword,
      name: nameKeyword,
      load: "load" + keyword,
      new: "new" + keyword,
      from: "from" + keyword,
      migrate: "migrate" + keyword,
      getVersion: "getVersion" + keyword
    };
  }
  /**
   * Assigns stt.id, either from the struct's name (the default) or from the
   * registration counter. Throws on a stable-id collision rather than letting
   * two structs share an id: an id collision is silent data corruption.
   */
  assignStructId(stt) {
    if (!this.stableIds) {
      stt.id = this.idgen++;
      return stt.id;
    }
    const id = this.stableIdOverrides[stt.name] ?? stableStructId(stt.name);
    const clash = this.struct_ids[id];
    if (clash !== void 0 && clash.name !== stt.name) {
      throw new Error(
        "nstructjs: stable struct id collision between " + clash.name + " and " + stt.name + " (both " + id + "). Pin one of them through STRUCT.stableIdOverrides."
      );
    }
    stt.id = id;
    return id;
  }
  define_null_native(name, cls) {
    const keywords = this.constructor.keywords;
    const obj = define_empty_class(this.constructor, name);
    const stt = struct_parse.parse(obj[keywords.script]);
    this.assignStructId(stt);
    this.structs[name] = stt;
    this.struct_cls[name] = cls;
    this.struct_ids[stt.id] = stt;
    this.null_natives[name] = 1;
  }
  validateStructs(onerror) {
    function getType(type) {
      switch (type.type) {
        case StructEnum.ITERKEYS:
        case StructEnum.ITER:
        case StructEnum.STATIC_ARRAY:
        case StructEnum.ARRAY:
          return getType(type.data.type);
        case StructEnum.TSTRUCT:
          return type;
        case StructEnum.STRUCT:
        default:
          return type;
      }
    }
    function formatType(type) {
      const ret = {};
      ret.type = type.type;
      if (typeof ret.type === "number") {
        for (const k in StructEnum) {
          if (StructEnum[k] === ret.type) {
            ret.type = k;
            break;
          }
        }
      } else if (typeof ret.type === "object") {
        ret.type = formatType(ret.type);
      }
      if (typeof type.data === "object") {
        ret.data = formatType(type.data);
      } else {
        ret.data = type.data;
      }
      return ret;
    }
    function throwError(stt, field, msg) {
      const buf = _STRUCT.formatStruct(stt);
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
          const type2 = field.type.type;
          if (ValueTypes.has(type2)) {
            throwError(stt, field, "'this' cannot be used with value types");
          }
        }
        const type = getType(field.type);
        if (type.type !== StructEnum.STRUCT && type.type !== StructEnum.TSTRUCT) {
          continue;
        }
        if (!(type.data in this.structs)) {
          const msg = stt.name + ":" + field.name + ": Unknown struct " + type.data + ".";
          throwError(stt, field, msg);
        }
      }
    }
  }
  forEach(func, thisvar) {
    for (const k in this.structs) {
      const stt = this.structs[k];
      if (thisvar !== void 0) func.call(thisvar, stt);
      else func(stt);
    }
  }
  // defaults to structjs.manager
  parse_structs(buf, defined_classes, version = 0) {
    const keywords = this.constructor.keywords;
    if (defined_classes === void 0) {
      defined_classes = manager;
    }
    const migrationSource = defined_classes instanceof _STRUCT ? defined_classes : this;
    if (defined_classes instanceof _STRUCT) {
      const struct2 = defined_classes;
      const arr = [];
      for (const k in struct2.struct_cls) {
        arr.push(struct2.struct_cls[k]);
      }
      defined_classes = arr;
    }
    if (defined_classes === void 0) {
      const arr = [];
      for (const k in manager.struct_cls) {
        arr.push(manager.struct_cls[k]);
      }
      defined_classes = arr;
    }
    const clsmap = {};
    for (let i = 0; i < defined_classes.length; i++) {
      const cls = defined_classes[i];
      if (!cls[keywords.name] && cls[keywords.script]) {
        const stt = struct_parse.parse(cls[keywords.script].trim());
        cls[keywords.name] = stt.name;
      } else if (!cls[keywords.name] && cls.name !== "Object") {
        if (warninglvl2 > 0) console.log("Warning, bad class in registered class list", unmangle(cls.name), cls);
        continue;
      }
      clsmap[cls[keywords.name]] = defined_classes[i];
    }
    struct_parse.input(buf);
    while (!struct_parse.at_end()) {
      const stt = struct_parse.parse(void 0, false);
      const migratedName = migrationSource.structNameMigration(version, stt.name);
      if (!(migratedName in clsmap)) {
        if (!(stt.name in this.null_natives)) {
          if (warninglvl2 > 0) console.log("WARNING: struct " + stt.name + " is missing from class list.");
        }
        const dummy = define_empty_class(this.constructor, stt.name);
        dummy[keywords.script] = _STRUCT.fmt_struct(stt, void 0, void 0, void 0, true);
        dummy[keywords.name] = stt.name;
        dummy.prototype[keywords.name] = dummy.name;
        dummy[PARSE_STRUCTS_DUMMY] = true;
        this.struct_cls[dummy[keywords.name]] = dummy;
        this.structs[dummy[keywords.name]] = stt;
        if (stt.id !== -1) this.struct_ids[stt.id] = stt;
      } else {
        this.struct_cls[stt.name] = clsmap[migratedName];
        this.structs[stt.name] = stt;
        if (stt.id !== -1) this.struct_ids[stt.id] = stt;
      }
      let tok = struct_parse.peek();
      while (tok && (tok.value === "\n" || tok.value === "\r" || tok.value === "	" || tok.value === " ")) {
        tok = struct_parse.peek();
      }
    }
  }
  /** adds all structs referenced by cls inside of srcSTRUCT
   *  to this */
  registerGraph(srcSTRUCT, cls) {
    const keywords = this.constructor.keywords;
    if (!cls[keywords.name]) {
      console.warn("class was not in srcSTRUCT");
      this.register(cls);
      return;
    }
    let recStruct;
    const recArray = (t) => {
      switch (t.type) {
        case StructEnum.ARRAY:
          return recArray(t.data.type);
        case StructEnum.ITERKEYS:
          return recArray(t.data.type);
        case StructEnum.STATIC_ARRAY:
          return recArray(t.data.type);
        case StructEnum.ITER:
          return recArray(t.data.type);
        case StructEnum.STRUCT:
        case StructEnum.TSTRUCT: {
          const st2 = srcSTRUCT.structs[t.data];
          const cls2 = srcSTRUCT.struct_cls[st2.name];
          return recStruct(st2, cls2);
        }
      }
    };
    recStruct = (st2, cls2) => {
      if (!(cls2[keywords.name] in this.structs)) {
        this.add_class(cls2, cls2[keywords.name]);
      }
      for (const f of st2.fields) {
        if (f.type.type === StructEnum.STRUCT || f.type.type === StructEnum.TSTRUCT) {
          const st22 = srcSTRUCT.structs[f.type.data];
          const cls22 = srcSTRUCT.struct_cls[st22.name];
          recStruct(st22, cls22);
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
    const st = srcSTRUCT.structs[cls[keywords.name]];
    recStruct(st, cls);
  }
  mergeScripts(child, parent) {
    const stc = struct_parse.parse(child.trim());
    const stp = struct_parse.parse(parent.trim());
    const fieldset = /* @__PURE__ */ new Set();
    for (const f of stc.fields) {
      fieldset.add(f.name);
    }
    const fields = [];
    for (const f of stp.fields) {
      if (!fieldset.has(f.name)) {
        fields.push(f);
      }
    }
    stc.fields = fields.concat(stc.fields);
    return _STRUCT.fmt_struct(stc, false, false);
  }
  inlineRegister(cls, structScript) {
    const keywords = this.constructor.keywords;
    let p = Object.getPrototypeOf(cls);
    while (p && p !== Object) {
      if (p.hasOwnProperty(keywords.script)) {
        structScript = this.mergeScripts(structScript, p[keywords.script]);
        break;
      }
      p = Object.getPrototypeOf(p);
    }
    cls[keywords.script] = structScript;
    this.register(cls);
    return structScript;
  }
  register(cls, structName) {
    this.add_class(cls, structName);
  }
  unregister(cls) {
    const keywords = this.constructor.keywords;
    if (!cls || !cls[keywords.name] || !(cls[keywords.name] in this.struct_cls)) {
      console.warn("Class not registered with nstructjs", cls);
      return;
    }
    const st = this.structs[cls[keywords.name]];
    delete this.structs[cls[keywords.name]];
    delete this.struct_cls[cls[keywords.name]];
    delete this.struct_ids[st.id];
  }
  add_class(cls, structName) {
    if (cls === Object) {
      return;
    }
    const keywords = this.constructor.keywords;
    if (cls[keywords.script]) {
      let bad = false;
      let p = cls;
      while (p) {
        p = Object.getPrototypeOf(p);
        if (p && p[keywords.script] && p[keywords.script] === cls[keywords.script]) {
          bad = true;
          break;
        }
      }
      if (bad) {
        if (warninglvl2 > 0) {
          console.warn("Generating " + keywords.script + " script for derived class " + unmangle(cls.name));
        }
        if (!structName) {
          structName = unmangle(cls.name);
        }
        cls[keywords.script] = _STRUCT.inherit(cls, p) + "\n}";
      }
    }
    if (!cls[keywords.script]) {
      throw new Error("class " + unmangle(cls.name) + " has no " + keywords.script + " script");
    }
    const stt = struct_parse.parse(cls[keywords.script]);
    stt.name = unmangle(stt.name);
    cls[keywords.name] = stt.name;
    if (cls[keywords.new] === void 0) {
      cls[keywords.new] = function() {
        return new this();
      };
    }
    if (structName !== void 0) {
      stt.name = structName;
      cls[keywords.name] = structName;
    } else if (cls[keywords.name] === void 0) {
      cls[keywords.name] = stt.name;
    } else {
      stt.name = cls[keywords.name];
    }
    if (cls[keywords.name] in this.structs) {
      if (warninglvl2 > 0) {
        console.warn("Struct " + unmangle(cls[keywords.name]) + " is already registered", cls);
      }
      if (!this.allowOverriding) {
        throw new Error("Struct " + unmangle(cls[keywords.name]) + " is already registered");
      }
      return;
    }
    if (stt.id === -1 || this.stableIds) this.assignStructId(stt);
    this.structs[cls[keywords.name]] = stt;
    this.struct_cls[cls[keywords.name]] = cls;
    this.struct_ids[stt.id] = stt;
  }
  isRegistered(cls) {
    const keywords = this.constructor.keywords;
    if (!cls.hasOwnProperty(keywords.name)) {
      return false;
    }
    return cls === this.struct_cls[cls[keywords.name]];
  }
  get_struct_id(id) {
    return this.struct_ids[id];
  }
  get_struct(name) {
    if (!(name in this.structs)) {
      console.warn("Unknown struct", name);
      throw new Error("Unknown struct " + name);
    }
    return this.structs[name];
  }
  get_struct_cls(name) {
    return this.struct_cls[name];
  }
  _env_call(code2, obj, env) {
    let envcode = _static_envcode_null2;
    if (env !== void 0) {
      envcode = "";
      for (let i = 0; i < env.length; i++) {
        envcode = "let " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
      }
    }
    let fullcode = "";
    if (envcode !== _static_envcode_null2) fullcode = envcode + code2;
    else fullcode = code2;
    let func;
    if (!(fullcode in this.compiled_code)) {
      const code22 = "func = function(obj, env) { " + envcode + "return " + code2 + "}";
      try {
        func = struct_eval.structEval(code22);
      } catch (err) {
        console.warn(err.stack);
        console.warn(code22);
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
      console.warn(err.stack);
      const code22 = "func = function(obj, env) { " + envcode + "return " + code2 + "}";
      console.warn(code22);
      console.warn(" ");
      throw err;
    }
  }
  write_struct(data, obj, stt) {
    function use_helper_js(field) {
      const type = field.type.type;
      const cls = StructFieldTypeMap[type];
      return cls.useHelperJS(field);
    }
    const fields = stt.fields;
    const thestruct = this;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const t1 = f.type;
      const t2 = t1.type;
      if (use_helper_js(f)) {
        let val;
        const type = t2;
        if (f.get !== void 0) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }
        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }
        sintern2.do_pack(this, data, val, obj, f, t1);
      } else {
        const val = f.name === "this" ? obj : obj[f.name];
        sintern2.do_pack(this, data, val, obj, f, t1);
      }
    }
  }
  write_object(data, obj) {
    const keywords = this.constructor.keywords;
    const cls = obj.constructor[keywords.name];
    const stt = this.get_struct(cls);
    if (data === void 0) {
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
     @param version : starting version passed to migrateSTRUCT/getVersionSTRUCT
       during the read; unlike migrateJSON, binary has no separate migration
       pass ahead of the read, so migration happens in-place as each struct
       finishes loading. Defaults to 0.
     @return Instance of cls_or_struct_id
     */
  readObject(data, cls_or_struct_id, uctx, version) {
    if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      data = new DataView(data.buffer);
    } else if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }
    return this.read_object(data, cls_or_struct_id, uctx, void 0, version);
  }
  writeObject(data, obj) {
    return this.write_object(data, obj);
  }
  writeJSON(obj, stt) {
    const keywords = this.constructor.keywords;
    const cls = obj.constructor;
    stt = stt || this.get_struct(cls[keywords.name]);
    function use_helper_js(field) {
      const type = field.type.type;
      const fieldCls = StructFieldTypeMap[type];
      return fieldCls.useHelperJS(field);
    }
    const toJSON2 = sintern2.toJSON;
    const fields = stt.fields;
    const thestruct = this;
    const json = {};
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      let val;
      const t1 = f.type;
      let json2;
      if (use_helper_js(f)) {
        if (f.get !== void 0) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }
        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }
        json2 = toJSON2(this, val, obj, f, t1);
      } else {
        val = f.name === "this" ? obj : obj[f.name];
        json2 = toJSON2(this, val, obj, f, t1);
      }
      if (f.name !== "this") {
        json[f.name] = json2;
      } else {
        const isArrayCheck = Array.isArray(json2);
        let isArray = isArrayCheck || f.type.type === StructTypes.ARRAY;
        isArray = isArray || f.type.type === StructTypes.STATIC_ARRAY;
        if (isArray) {
          const arr = json2;
          json.length = arr.length;
          for (let j = 0; j < arr.length; j++) {
            json[j] = arr[j];
          }
        } else {
          Object.assign(json, json2);
        }
      }
    }
    return json;
  }
  /**
   @param data : DataView or Uint8Array instance
   @param cls_or_struct_id : Structable class
   @param uctx : internal parameter
   */
  read_object(data, cls_or_struct_id, uctx, objInstance, rootVersion) {
    const keywords = this.constructor.keywords;
    let cls;
    let stt;
    if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }
    let unknownClassSchema;
    if (typeof cls_or_struct_id === "number") {
      const fileSchema = this.struct_ids[cls_or_struct_id];
      cls = this.struct_cls[fileSchema.name];
      unknownClassSchema = fileSchema;
      if ((cls === void 0 || isParseStructsDummy(cls)) && this.onUnknownClass) {
        const hookResult = this.onUnknownClass(fileSchema.name, fileSchema);
        if (hookResult !== void 0) {
          cls = hookResult;
        }
      }
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    stt = unknownClassSchema ?? this.structs[cls[keywords.name]];
    if (uctx === void 0) {
      uctx = new unpack_context(rootVersion ?? 0);
      packer_debug2("\n\n=Begin reading " + cls[keywords.name] + "=");
    }
    const this2 = this;
    const typeMap = StructFieldTypeMap;
    let was_run = false;
    const loader = function load(obj2) {
      if (was_run) {
        return;
      }
      was_run = true;
      const fields = stt.fields;
      const flen = fields.length;
      for (let i = 0; i < flen; i++) {
        const f = fields[i];
        if (f.name === "this") {
          typeMap[f.type.type].unpackInto(this2, data, f.type, uctx, obj2);
        } else {
          obj2[f.name] = typeMap[f.type.type].unpack(this2, data, f.type, uctx);
        }
      }
    };
    let obj;
    if (cls.prototype[keywords.load] !== void 0) {
      obj = objInstance;
      if (!obj && cls[keywords.new] !== void 0) {
        obj = cls[keywords.new].call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      const objAny = obj;
      objAny[keywords.load](loader);
      if (!was_run) {
        console.warn(
          "" + cls[keywords.name] + ".prototype[keywords.load]() did not execute its loader callback!"
        );
        loader(obj);
      }
    } else if (cls[keywords.from] !== void 0) {
      if (warninglvl2 > 1) {
        console.warn(
          "Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead"
        );
      }
      const anyCls2 = cls;
      obj = anyCls2[keywords.from](loader);
    } else {
      obj = objInstance;
      if (!obj && cls[keywords.new] !== void 0) {
        obj = cls[keywords.new].call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      loader(obj);
    }
    const anyCls = cls;
    if (anyCls[keywords.migrate] !== void 0) {
      const version = anyCls[keywords.getVersion] !== void 0 ? anyCls[keywords.getVersion](obj) : uctx.version;
      anyCls[keywords.migrate](version, obj, binaryMigrateFinisher);
    }
    return obj;
  }
  addStructNameMigration(version, oldName, newName) {
    let item = this.struct_names_migrations.find((i) => i.version === version);
    if (item === void 0) {
      item = { version, map: /* @__PURE__ */ new Map() };
      this.struct_names_migrations.push(item);
      this.struct_names_migrations.sort((a, b) => a.version - b.version);
    } else if (item.map.has(oldName)) {
      throw new Error("Struct name migration already exists for " + oldName + " at version " + version);
    }
    item.map.set(oldName, newName);
    return this;
  }
  /**
   * `addStructNameMigration(V, oldName, newName)` means "renamed as of
   * version V": data older than V (version < V) still has `oldName` and
   * needs translating; data at V or newer already has `newName`. Each call
   * registers one historical step, and this chases the whole chain --
   * `Widget@v2 -> Gadget`, `Gadget@v3 -> Thing` resolves `Widget` all the
   * way to `Thing` -- rather than requiring every old name to be registered
   * straight to whatever the current name happens to be.
   *
   * A name reused more than once (`a@V1 -> b`, `e@V2 -> a`, `a@V3 -> e`) can
   * make a later hop chase back to a name already visited in this same
   * lookup; that's a dead end; not a loop, so resolution stops there and
   * returns the last name reached rather than cycling forever.
   */
  structNameMigration(version, name) {
    const seen = /* @__PURE__ */ new Set([name]);
    for (; ; ) {
      let next;
      for (let i = 0; i < this.struct_names_migrations.length; i++) {
        const item = this.struct_names_migrations[i];
        if (version < item.version && item.map.has(name)) {
          next = item.map.get(name);
          break;
        }
      }
      if (next === void 0 || seen.has(next)) {
        return name;
      }
      name = next;
      seen.add(name);
    }
  }
  migrateJSON(json, cls_or_struct_id, options, stt) {
    const warnMissing = options.warnMissing ?? true;
    const keywords = this.constructor.keywords;
    options.reporter = options.reporter ?? ((s) => console.log(s));
    const reporter = options.reporter;
    let cls;
    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    if (stt === void 0) {
      stt = this.get_struct(cls[keywords.name]);
    }
    const getVersion = (parentVersion, presentStructName, data) => {
      const cls2 = this.get_struct_cls(presentStructName);
      if (cls2 === void 0) {
        if (warnMissing) {
          reporter("Struct " + presentStructName + " not found, migration may be incomplete");
          reporter("Use nstructjs.addStructNameMigration() to fix this.");
        }
        return parentVersion;
      }
      if (cls2[keywords.getVersion] !== void 0) {
        return cls2[keywords.getVersion](data);
      }
      return parentVersion;
    };
    const getStruct = (version, sname, doVersion = true) => {
      if (doVersion) {
        sname = this.structNameMigration(version, sname);
      }
      if (!(sname in this.structs)) {
        if (warnMissing) {
          reporter("Struct " + sname + " not found, migration may be incomplete");
          reporter("Use nstructjs.addStructNameMigration() to fix this");
        }
        return void 0;
      }
      return this.structs[sname];
    };
    const isPossibleType = (type) => {
      switch (type) {
        case StructEnum.ARRAY:
        case StructEnum.ITER:
        case StructEnum.ITERKEYS:
        case StructEnum.STATIC_ARRAY:
        case StructEnum.TSTRUCT:
        case StructEnum.STRUCT:
        case StructEnum.OPTIONAL:
          return true;
      }
      return false;
    };
    const walkable = (data) => typeof data === "object" && data !== null && !Array.isArray(data);
    const walkArray = (version, arrayType, data) => {
      if (!isPossibleType(arrayType.type) || !Array.isArray(data)) {
        return;
      }
      for (const item of data) {
        dispatch(version, arrayType.data.type, item);
      }
    };
    const walkStruct = (version, sname, data, doVersion) => {
      if (!walkable(data)) {
        return;
      }
      const stt2 = getStruct(version, sname, doVersion);
      if (!stt2) {
        return;
      }
      const version2 = getVersion(version, stt2.name, data);
      const finish = (excludeFields) => {
        for (const field of stt2.fields) {
          if (isPossibleType(field.type.type) && !excludeFields?.includes(field.name)) {
            dispatch(version2, field.type, data[field.name]);
          }
        }
      };
      const cls2 = this.get_struct_cls(sname);
      if (cls2[keywords.migrate] !== void 0) {
        cls2[keywords.migrate](version2, data, finish);
      } else {
        finish();
      }
    };
    const walkIterKeys = (version, type, data) => {
      if (!walkable(data)) {
        return;
      }
      for (const key of Object.keys(data)) {
        dispatch(version, type.data.type, data[key]);
      }
    };
    const this2 = this;
    function dispatch(version, type, data) {
      switch (type.type) {
        case StructEnum.ARRAY:
        case StructEnum.ITER:
        case StructEnum.STATIC_ARRAY:
          walkArray(version, type, data);
          break;
        case StructEnum.STRUCT:
          walkStruct(version, type.data, data);
          break;
        case StructEnum.ITERKEYS:
          walkIterKeys(version, type, data);
          break;
        case StructEnum.TSTRUCT: {
          if (!walkable(data)) {
            break;
          }
          const was = data[type.jsonKeyword];
          const name = this2.structNameMigration(version, was);
          if (name !== was) {
            data[type.jsonKeyword] = name;
          }
          walkStruct(getVersion(version, name, data), name, data, false);
          break;
        }
        case StructEnum.OPTIONAL:
          if (data !== void 0 && data !== null) {
            dispatch(version, type.data, data);
          }
          break;
      }
    }
    return walkStruct(options.version, stt.name, json, true);
  }
  validateJSON(json, cls_or_struct_id, useInternalParser = true, useColors = true, consoleLogger2 = function(...args) {
    console.log(...args);
  }, _abstractKey = "_structName") {
    if (cls_or_struct_id === void 0) {
      throw new Error(this.constructor.name + ".prototype.validateJSON: Expected at least two arguments");
    }
    try {
      let jsonStr = JSON.stringify(json, void 0, 2);
      this.jsonBuf = jsonStr;
      this.jsonUseColors = useColors;
      this.jsonLogger = consoleLogger2;
      struct_json_default.logger = this.jsonLogger;
      let parsed;
      if (useInternalParser) {
        parsed = struct_json_default.parse(jsonStr);
      } else {
        parsed = JSON.parse(jsonStr);
      }
      this.validateJSONIntern(parsed, cls_or_struct_id, _abstractKey);
    } catch (error) {
      if (!(error instanceof JSONError)) {
        console.error(error.stack);
      }
      this.jsonLogger(error.message);
      return false;
    }
    return true;
  }
  validateJSONIntern(json, cls_or_struct_id, _abstractKey = "_structName") {
    const keywords = this.constructor.keywords;
    let cls;
    let stt;
    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    stt = this.structs[cls[keywords.name]];
    if (stt === void 0) {
      throw new Error("unknown class " + cls);
    }
    const fields = stt.fields;
    const flen = fields.length;
    const keys = /* @__PURE__ */ new Set();
    keys.add(_abstractKey);
    let keyTestJson = json;
    for (let i = 0; i < flen; i++) {
      const f = fields[i];
      let val;
      let tokinfo;
      if (f.name === "this") {
        val = json;
        keyTestJson = {
          "this": json
        };
        keys.add("this");
        tokinfo = json[TokSymbol];
      } else {
        val = json[f.name];
        keys.add(f.name);
        const jsonTokInfo = json[TokSymbol];
        tokinfo = jsonTokInfo ? jsonTokInfo.fields[f.name] : void 0;
        if (!tokinfo) {
          const f2 = fields[Math.max(i - 1, 0)];
          const tokSymTokInfo = TokSymbol[TokSymbol];
          tokinfo = tokSymTokInfo ? tokSymTokInfo.fields[f2.name] : void 0;
        }
        if (!tokinfo) {
          tokinfo = json[TokSymbol];
        }
      }
      if (val === void 0) {
      }
      const instance = f.name === "this" ? val : json;
      const { ok, tokInfo: tokinfo2 } = sintern2.validateJSON(this, val, json, f, f.type, instance, _abstractKey);
      if (!ok || typeof ok === "string") {
        const msg = typeof ok === "string" ? ": " + ok : "";
        if (tokinfo2) {
          this.jsonLogger(printContext(this.jsonBuf, tokinfo2, this.jsonUseColors));
        }
        if (val === void 0) {
          throw new JSONError(stt.name + ": Missing json field " + f.name + msg);
        } else {
          throw new JSONError(stt.name + ": Invalid json field " + f.name + msg);
        }
      }
    }
    for (const k in keyTestJson) {
      if (typeof json[k] === "symbol") {
        continue;
      }
      if (!keys.has(k)) {
        this.jsonLogger(cls[keywords.script]);
        throw new JSONError(stt.name + ": Unknown json field " + k);
      }
    }
    return { ok: true };
  }
  /**
   * Deserialize from json.
   * If migrate is not undefined, migration will be applied in-place
   * prior to deserialization; note this is different from binary which
   * happens in-place during deserialization.
   */
  readJSON(json, cls_or_struct_id, objInstance, migrate) {
    if (migrate) {
      this.migrateJSON(json, cls_or_struct_id, migrate);
    }
    const keywords = this.constructor.keywords;
    let cls;
    let stt;
    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    stt = this.structs[cls[keywords.name]];
    packer_debug2("\n\n=Begin reading " + cls[keywords.name] + "=");
    const thestruct = this;
    const this2 = this;
    let was_run = false;
    const fromJSON2 = sintern2.fromJSON;
    function makeLoader(stt2) {
      return function load(obj) {
        if (was_run) {
          return;
        }
        was_run = true;
        const fields = stt2.fields;
        const flen = fields.length;
        for (let i = 0; i < flen; i++) {
          const f = fields[i];
          let val;
          if (f.name === "this") {
            val = json;
          } else {
            val = json[f.name];
          }
          if ((val === void 0 || val === null) && f.type.type !== StructEnum.OPTIONAL) {
            if (warninglvl2 > 1) {
              console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt2.name);
            }
            continue;
          }
          const instance = f.name === "this" ? obj : objInstance;
          const ret = fromJSON2(this2, val, obj, f, f.type, instance);
          if (f.name !== "this") {
            obj[f.name] = ret;
          }
        }
      };
    }
    const loader = makeLoader(stt);
    if (cls.prototype[keywords.load] !== void 0) {
      let obj = objInstance;
      if (!obj && cls[keywords.new] !== void 0) {
        obj = cls[keywords.new].call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      const anyObj = obj;
      anyObj[keywords.load](loader);
      return obj;
    } else if (cls[keywords.from] !== void 0) {
      if (warninglvl2 > 1) {
        console.warn(
          "Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead"
        );
      }
      const anyCls = cls;
      return anyCls[keywords.from](loader);
    } else {
      let obj = objInstance;
      if (!obj && cls[keywords.new] !== void 0) {
        obj = cls[keywords.new].call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      loader(obj);
      return obj;
    }
  }
  formatJSON_intern(json, stt, field, tlvl = 0) {
    const keywords = this.constructor.keywords;
    const addComments = this.formatCtx.addComments;
    let s = "{";
    if (addComments && field && field.comment.trim()) {
      s += " " + field.comment.trim();
    }
    s += "\n";
    for (const f of stt.fields) {
      const value = json[f.name];
      s += tab(tlvl + 1) + f.name + ": ";
      s += sintern2.formatJSON(this, value, json, f, f.type, void 0, tlvl + 1);
      s += ",";
      const basetype = f.type.type;
      let resolvedType = basetype;
      if (ArrayTypes.has(basetype)) {
        resolvedType = f.type.data.type.type;
      }
      const addComment = ValueTypes.has(resolvedType) && addComments && f.comment.trim();
      if (addComment) {
        s += " " + f.comment.trim();
      }
      s += "\n";
    }
    s += tab(tlvl) + "}";
    return s;
  }
  formatJSON(json, cls, addComments = true, validate = true) {
    const keywords = this.constructor.keywords;
    let s = "";
    if (validate) {
      this.validateJSON(json, cls);
    }
    const stt = this.structs[cls[keywords.name]];
    this.formatCtx = {
      addComments,
      validate
    };
    return this.formatJSON_intern(json, stt);
  }
};
STRUCT.setClassKeyword("STRUCT");
function deriveStructManager(keywords = {
  script: "STRUCT",
  name: void 0,
  load: void 0,
  new: void 0,
  from: void 0,
  migrate: void 0,
  getVersion: void 0
}) {
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
  if (!keywords.migrate) {
    keywords.migrate = "migrate" + keywords.script;
  }
  if (!keywords.getVersion) {
    keywords.getVersion = "getVersion" + keywords.script;
  }
  class NewSTRUCT extends STRUCT {
  }
  NewSTRUCT.keywords = keywords;
  return NewSTRUCT;
}
manager = new STRUCT();
function write_scripts(nManager = manager, include_code = false) {
  let buf = "";
  const nl = String.fromCharCode(10);
  const tab2 = String.fromCharCode(9);
  nManager.forEach(function(stt) {
    buf += STRUCT.fmt_struct(stt, false, !include_code) + nl;
  });
  let buf2 = buf;
  buf = "";
  for (let i = 0; i < buf2.length; i++) {
    const c = buf2[i];
    if (c === nl) {
      buf += nl;
      const i2 = i;
      while (i < buf2.length && (buf2[i] === " " || buf2[i] === tab2 || buf2[i] === nl)) {
        i++;
      }
      if (i !== i2) i--;
    } else {
      buf += c;
    }
  }
  return buf;
}

// src/struct_filehelper.ts
var nbtoa;
var natob;
if (typeof btoa === "undefined") {
  nbtoa = function(str) {
    const buffer = Buffer.from("" + str, "binary");
    return buffer.toString("base64");
  };
  natob = function(str) {
    return Buffer.from(str, "base64").toString("binary");
  };
} else {
  natob = atob;
  nbtoa = btoa;
}
function versionToInt(v) {
  const ver = versionCoerce(v);
  const mul = 64;
  return ~~(ver.major * mul * mul * mul + ver.minor * mul * mul + ver.micro * mul);
}
var ver_pat = /[0-9]+\.[0-9]+\.[0-9]+$/;
function versionCoerce(v) {
  if (!v) {
    throw new Error("empty version: " + v);
  }
  if (typeof v === "string") {
    if (!ver_pat.exec(v)) {
      throw new Error("invalid version string " + v);
    }
    const ver = v.split(".");
    return {
      major: parseInt(ver[0]),
      minor: parseInt(ver[1]),
      micro: parseInt(ver[2])
    };
  } else if (Array.isArray(v)) {
    return {
      major: v[0],
      minor: v[1],
      micro: v[2]
    };
  } else if (typeof v === "object") {
    const test2 = (k) => k in v && typeof v[k] === "number";
    if (!test2("major") || !test2("minor") || !test2("micro")) {
      throw new Error("invalid version object: " + v);
    }
    return v;
  } else {
    throw new Error("invalid version " + v);
  }
}
function versionLessThan(a, b) {
  return versionToInt(a) < versionToInt(b);
}
var FileParams = class {
  constructor() {
    this.magic = "STRT";
    this.ext = ".bin";
    this.blocktypes = ["DATA"];
    this.version = {
      major: 0,
      minor: 0,
      micro: 1
    };
  }
};
var Block = class {
  constructor(type, data) {
    this.type = type || "";
    this.data = data;
  }
};
var FileError = class extends Error {
};
var FileHelper = class {
  //params can be FileParams instance, or object literal
  //(it will convert to FileParams)
  constructor(params) {
    const fp = new FileParams();
    if (params !== void 0) {
      for (const k in params) {
        fp[k] = params[k];
      }
    }
    this.version = fp.version;
    this.blocktypes = fp.blocktypes;
    this.magic = fp.magic;
    this.ext = fp.ext;
    this.struct = void 0;
    this.unpack_ctx = void 0;
  }
  read(dataview) {
    this.unpack_ctx = new unpack_context();
    const magic = unpack_static_string(dataview, this.unpack_ctx, 4);
    if (magic !== this.magic) {
      throw new FileError("corrupted file");
    }
    this.version = {
      major: 0,
      minor: 0,
      micro: 0
    };
    this.version.major = unpack_short(dataview, this.unpack_ctx);
    this.version.minor = unpack_byte(dataview, this.unpack_ctx);
    this.version.micro = unpack_byte(dataview, this.unpack_ctx);
    const struct = this.struct = new STRUCT();
    const fileVersion = versionToInt(this.version);
    const scripts = unpack_string(dataview, this.unpack_ctx);
    this.struct.parse_structs(scripts, manager, fileVersion);
    const blocks = [];
    const dviewlen = dataview.buffer.byteLength;
    while (this.unpack_ctx.i < dviewlen) {
      const type = unpack_static_string(dataview, this.unpack_ctx, 4);
      const datalen = unpack_int(dataview, this.unpack_ctx);
      const bstruct = unpack_int(dataview, this.unpack_ctx);
      let bdata;
      if (bstruct === -2) {
        bdata = unpack_static_string(dataview, this.unpack_ctx, datalen);
      } else {
        const rawData = unpack_bytes(dataview, this.unpack_ctx, datalen);
        bdata = struct.read_object(rawData, bstruct, new unpack_context(fileVersion));
      }
      const block = new Block();
      block.type = type;
      block.data = bdata;
      blocks.push(block);
    }
    this.blocks = blocks;
    return blocks;
  }
  doVersions(old) {
    if (versionLessThan(old, "0.0.1")) {
    }
  }
  write(blocks) {
    this.struct = manager;
    this.blocks = blocks;
    const data = new BinWriter();
    pack_static_string(data, this.magic, 4);
    pack_short(data, this.version.major);
    pack_byte(data, this.version.minor & 255);
    pack_byte(data, this.version.micro & 255);
    const scripts = write_scripts();
    pack_string(data, scripts);
    const struct = this.struct;
    for (const block of blocks) {
      if (typeof block.data === "string") {
        pack_static_string(data, block.type, 4);
        pack_int(data, block.data.length);
        pack_int(data, -2);
        pack_static_string(data, block.data, block.data.length);
        continue;
      }
      const blockData = block.data;
      const structNameVal = blockData.constructor.structName;
      if (structNameVal === void 0 || !(structNameVal in struct.structs)) {
        throw new Error("Non-STRUCTable object " + block.data);
      }
      const data2 = new BinWriter();
      const stt = struct.structs[structNameVal];
      struct.write_object(data2, block.data);
      pack_static_string(data, block.type, 4);
      pack_int(data, data2.length);
      pack_int(data, stt.id);
      data.pushBytes(data2.finish());
    }
    return new DataView(data.toBytes().buffer);
  }
  writeBase64(blocks) {
    const dataview = this.write(blocks);
    let str = "";
    const bytes = new Uint8Array(dataview.buffer);
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return nbtoa(str);
  }
  makeBlock(type, data) {
    return new Block(type, data);
  }
  readBase64(base64) {
    const data = natob(base64);
    const data2 = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      data2[i] = data.charCodeAt(i);
    }
    return this.read(new DataView(data2.buffer));
  }
};

// tinyeval/tinyeval.js
var acorn1 = __toESM(require_acorn(), 1);
var walk1 = __toESM(require_walk(), 1);
var acorn = acorn1;
var walk = walk1;
acorn = acorn.default ? acorn.default : acorn;
walk = walk.default ? walk.default : walk;
var exports2 = { acorn, walk };
var color = exports2.color = function color2(str, c) {
  return "\x1B[" + c + "m" + str + "\x1B[0m";
};
var formatLines = (buf) => {
  let i = 1;
  let s = "";
  for (let l of buf.split("\n")) {
    let j = "" + i;
    while (j.length < 4) {
      j = " " + j;
    }
    s += j + ": " + l + "\n";
  }
  return s;
};
var ReturnException = class extends Error {
};
var cache = {};
exports2.eval = function(buf, scope = {}) {
  let debug2 = 0;
  let stack = [];
  let startstate = { stack, scope };
  if (!("undefined" in scope)) {
    scope["undefined"] = void 0;
  }
  if (!("null" in scope)) {
    scope["null"] = null;
  }
  let node;
  if (buf in cache) {
    node = cache[buf];
  } else {
    node = acorn.parse(buf);
  }
  let scopePush = (state, scope2 = {}) => {
    let ret = {
      stack: state.stack,
      scope: Object.create(state.scope)
      //Object.assign({}, state.scope)
    };
    for (let k in scope2) {
      ret.scope[k] = scope2[k];
    }
    return ret;
  };
  let nodeIs = (n, type) => {
    return n && typeof n === "object" && n.type === type;
  };
  let walkers = {
    ThisExpression(n, state, visit) {
      state.stack.push(state.scope["this"]);
    },
    VariableDeclaration(n, state, visit) {
      for (let d of n.declarations) {
        let name = d.id.name;
        visit(d.init, state);
        state.scope[name] = state.stack.pop();
      }
    },
    MemberExpression(n, state, visit) {
      visit(n.object, state);
      let a = state.stack.pop();
      if (nodeIs(a, "Identifier")) {
        let name = a.name;
        a = state.scope[name];
      }
      let state2 = state;
      state2.scope["this"] = a;
      visit(n.property, state);
      let b = state2.stack.pop();
      if (nodeIs(b, "Identifier")) {
        if (n.computed) {
          b = state2.scope[b.name];
        } else {
          b = b.name;
        }
      } else if (nodeIs(b, "Literal")) {
        b = b.value;
      }
      a = a[b];
      state.stack.push(a);
    },
    ArrowFunctionExpression(n, state, visit) {
      this.FunctionExpression(n, state, visit, true);
    },
    FunctionExpression(n, state, visit, useLexThis = false) {
      let args = [];
      let state2 = scopePush(state);
      state2.stack = [];
      for (let arg of n.params) {
        arg = arg.name;
        args.push(arg);
      }
      function func() {
        if (debug2) {
        }
        for (let i = 0; i < args.length; i++) {
          state2.scope[args[i]] = arguments[i];
        }
        if (!useLexThis) {
          state2.scope["this"] = this;
        }
        let this2 = !useLexThis ? this : state2.scope["this"];
        if (state2.scope["this"] && state2.scope["this"].constructor.name[0].search(/[PAC]/) < 0) {
        }
        try {
          visit(n.body, state2);
        } catch (error) {
          if (!(error instanceof ReturnException)) {
            console.log(error.stack);
            console.log(error);
            console.log(state2.scope["this"]);
            throw error;
          }
        }
        let ret = state2.stack.pop();
        if (debug2) {
          console.log(" RET IN FUNC", ret, state2.stack);
        }
        if (ret && ret.type === "Identifier") {
          ret = state2.scope[ret.name];
        }
        return ret;
      }
      state.stack.push(func);
    },
    ObjectExpression(n, state, visit) {
      let ret = {};
      for (let prop of n.properties) {
        let key = prop.key;
        if (!prop.computed) {
          key = key.name;
        } else {
          visit(key, state);
          key = this._getValue(state.stack.pop(), state);
        }
        visit(prop.value, state);
        let val = this._getValue(state.stack.pop(), state);
        ret[key] = val;
      }
      state.stack.push(ret);
    },
    CallExpression(n, state, visit) {
      state = scopePush(state);
      visit(n.callee, state);
      let func = state.stack.pop();
      let args = [];
      for (let arg of n.arguments) {
        visit(arg, state);
        let val = this._getValue(state.stack.pop(), state);
        args.push(val);
      }
      let thisvar = state.scope["this"];
      let ret = func.apply(thisvar, args);
      if (debug2) {
        console.log("  RET", ret, args);
      }
      state.stack.push(ret);
    },
    ArrayExpression(n, state, visit) {
      let ret = [];
      for (let e of n.elements) {
        visit(e, state);
        let val = this._getValue(state.stack.pop(), state);
        ret.push(val);
      }
      state.stack.push(ret);
    },
    ReturnStatement(n, state, visit) {
      if (n.argument) {
        visit(n.argument, state);
      }
      throw new ReturnException();
    },
    Literal(n, state, visit) {
      state.stack.push(n.value);
    },
    _getValue(n, state) {
      if (n === void 0 || n === null) {
        return n;
      }
      if (nodeIs(n, "Identifier")) {
        if (!(n.name in state.scope)) {
          console.log(buf);
          throw new Error(n.name + " is not defined");
        }
        return state.scope[n.name];
      }
      if (nodeIs(n, "Literal")) {
        return n.value;
      }
      return n;
    },
    BinaryExpression(n, state, visit) {
      visit(n.left, state);
      let a = state.stack.pop();
      a = this._getValue(a, state);
      visit(n.right, state);
      let b = state.stack.pop();
      b = this._getValue(b, state);
      switch (n.operator) {
        case "+":
          if (typeof a === "string" || typeof b === "string") {
            stack.push("" + a + b);
            break;
          }
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "/":
          stack.push(a / b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "**":
          stack.push(a ** b);
          break;
        case ">":
          stack.push(a > b);
          break;
        case "<":
          stack.push(a < b);
          break;
        case ">=":
          stack.push(a >= b);
          break;
        case "<=":
          stack.push(a <= b);
          break;
        case "==":
          stack.push(a == b);
          break;
        case "===":
          stack.push(a === b);
          break;
        case "!=":
          stack.push(a != b);
          break;
        case "!==":
          stack.push(a !== b);
          break;
        case "%":
          stack.push(a % b);
          break;
        case "^":
          stack.push(a ^ b);
          break;
        case "&":
          stack.push(a & b);
          break;
        case "|":
          stack.push(a | b);
          break;
        case "<<":
          stack.push(a << b);
          break;
        case ">>":
          stack.push(a >> b);
          break;
        case ">>>":
          stack.push(a >>> b);
          break;
        case "instanceof":
          stack.push(a instanceof b);
          break;
      }
    },
    UnaryExpression(n, state, visit) {
      visit(n.argument, state);
      let val = this._getValue(state.stack.pop(), state);
      switch (n.operator) {
        case "!":
          val = !val;
          break;
        case "~":
          val = ~val;
          break;
        case "-":
          val = -val;
          break;
        case "+":
          val = +val;
          break;
        case "delete":
          delete state.scope["this"][val];
          return;
        case "typeof":
          val = typeof val;
          break;
      }
      state.stack.push(val);
    },
    ConditionalExpression(n, state, visit) {
      visit(n.test, state);
      let val = state.stack.pop();
      if (val) {
        visit(n.consequent, state);
      } else {
        visit(n.alternate, state);
      }
      let v = state.stack.pop();
      v = this._getValue(v, state);
      state.stack.push(v);
    },
    LogicalExpression(n, state, visit) {
      visit(n.left, state);
      let a = this._getValue(state.stack.pop(), state);
      visit(n.right, state);
      let b = this._getValue(state.stack.pop(), state);
      switch (n.operator) {
        case "||":
          state.stack.push(a || b);
          break;
        case "&&":
          state.stack.push(a && b);
          break;
      }
    },
    Identifier(n, state, visit) {
      state.stack.push(n);
    }
  };
  for (let k in walk.base) {
    if (!(k in walkers)) {
      walkers[k] = walk.base[k];
    }
  }
  if (debug2) {
    walk.full(node, (n) => {
      console.log(n.type);
    });
  }
  try {
    walk.recursive(node, startstate, walkers);
  } catch (error) {
    console.log(formatLines(buf));
    console.log(error.message);
  }
  if (stack[0]) {
    stack[0] = walkers._getValue(stack[0], startstate);
  }
  if (debug2) {
    console.log("final result", stack[0]);
  }
  return stack[0];
};
function test() {
  let a = { b: { c: { d: (e) => [1 + e, 2, 3] } } };
  let t = 0.3;
  console.log(a && a.y ? 1 : -1);
  "a.b.c.d(t)[0] + 1 + t";
  let fn = exports2.eval(
    `
    a = function(a, b){
        return a && a.y ? 1 : -1;
    }
    `,
    { a, t }
  );
  console.log(fn({ y: 1 }));
}
var tinyeval_default = exports2;

// src/structjs.ts
function truncateDollarSign2(value = true) {
  setTruncateDollarSign(value);
}
function validateStructs(onerror) {
  return manager.validateStructs(onerror);
}
function setEndian(mode) {
  const ret = STRUCT_ENDIAN;
  setBinaryEndian(mode);
  return ret;
}
function consoleLogger(...args) {
  console.log(...args);
}
function validateJSON2(json, cls, useInternalParser, printColors = true, logger = consoleLogger) {
  return manager.validateJSON(json, cls, useInternalParser, printColors, logger);
}
function getEndian() {
  return STRUCT_ENDIAN;
}
function setAllowOverriding(t) {
  return manager.allowOverriding = !!t;
}
function isRegistered(cls) {
  return manager.isRegistered(cls);
}
function inlineRegister(cls, structScript) {
  return manager.inlineRegister(cls, structScript);
}
function register(cls, structName) {
  return manager.register(cls, structName);
}
function unregister(cls) {
  manager.unregister(cls);
}
function inherit(child, parent, structName = child.name) {
  return STRUCT.inherit(child, parent, structName);
}
function readObject(data, cls, __uctx, version) {
  return manager.readObject(data, cls, __uctx, version);
}
function writeObject(data, obj) {
  return manager.writeObject(data, obj);
}
function writeJSON(obj) {
  return manager.writeJSON(obj);
}
function formatJSON2(json, cls, addComments = true, validate = true) {
  return manager.formatJSON(json, cls, addComments, validate);
}
function migrateJSON(json, class_or_struct_id, migrateOptions) {
  return manager.migrateJSON(json, class_or_struct_id, migrateOptions);
}
function readJSON(json, class_or_struct_id, migrate) {
  return manager.readJSON(json, class_or_struct_id, void 0, migrate);
}
var tinyeval = tinyeval_default;
function useTinyEval() {
  setStructEval((buf) => {
    return tinyeval.eval(
      buf,
      nGlobal
    );
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BinWriter,
  JSONError,
  STABLE_ID_BASE,
  STABLE_ID_LIMIT,
  STRUCT,
  _truncateDollarSign,
  binpack,
  consoleLogger,
  deriveStructManager,
  filehelper,
  formatJSON,
  getEndian,
  inherit,
  inlineRegister,
  isRegistered,
  manager,
  migrateJSON,
  parser,
  parseutil,
  readJSON,
  readObject,
  register,
  setAllowOverriding,
  setDebugMode,
  setEndian,
  setTruncateDollarSign,
  setWarningMode,
  stableStructId,
  tinyeval,
  truncateDollarSign,
  typesystem,
  unpack_context,
  unregister,
  useTinyEval,
  validateJSON,
  validateStructs,
  writeJSON,
  writeObject,
  write_scripts
});
  {
    let glob = !((typeof window === "undefined" && typeof self === "undefined") && typeof global !== "undefined");

    //try to detect nodejs in es6 module mode
    glob = glob || (typeof global !== "undefined" && typeof global.require === "undefined");


    if (glob) {
        //not nodejs?
        _nGlobal.nstructjs = module.exports;
        _nGlobal.module = undefined;
    }
  }
  
  return module.exports;
})();

if (typeof window === "undefined" && typeof global !== "undefined" && typeof module !== "undefined") {
  module.exports = exports = nexports;
}

