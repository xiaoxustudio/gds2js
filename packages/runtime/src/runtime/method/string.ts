import { GodotRuntimeError, UnsupportedError } from "../errors";
import { md5Hex } from "../md5";
import { bytesToHex, sha1Bytes, sha256Bytes } from "../hashes";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt, variantHashNumber,
  abs, lengthOf, range as gRange, sqrt, variantHash, gAngleDifference, gCubic, gClamp, gCeil, gDegToRad, gRadToDeg, gEase, gExp,
  gFloor, gFmod, gFposmod, gInverseLerp, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gLerp, gLog,
  gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gMoveToward, gPosmod, gPow, gRemap, gRound, gSign, gSignF, gSignI,
  gSmoothstep, gSnapped, gSnappedF, gSnappedI, gWrap, gAbsF, gAbsI, gWrapAny, gIsSame,
  gTypeString, gErrorString, gTypeExists,
  gWeakref, gInstanceFromId, gIsInstanceValid, gIsInstanceIdValid, gRidFromInt64, gRidAllocateId, gInstToDict,
  gRandi, gRandf, gRandomize, gSeed, gRandFromSeed, gRandiRange, gRandfRange, gRandfn,
  gSin, gCos, gTan, gAsin, gAcos, gAtan, gAtan2, gSinh, gCosh, gTanh, gAsinh, gAcosh, gAtanh, randNextUint32,
  gDbToLinear, gLinearToDb, gPingpong, gStepDecimals, gNearestPo2, gRotateToward, gLerpAngle,
  gBezierInterpolate, gBezierDerivative, gCubicAngle, gCubicInTime, gCubicAngleInTime } from "../builtins";
import { strToInt, strToFloat } from "../numstr";
import { GdScriptObject } from "../class/object/script-object";
import { faceMemberKnown, nativeAritySay } from "../face-arity";
import { stringFormatInvalidType, stringReplaceCharNul, stringReplaceCharsNul, stringUnicodeAsciiError, stringHexUnevenBlock } from "../frames";
import { Tag, V, tagName, type Variant } from "../tags";
import { GArray, strJoin, strFormatV } from "../values";
import { strBinToInt, strCaseStyle, strCapitalize, strCEscape, strCase, strContains, strCount, strEdge, strEndsWith, strEraseAt, strFind, strGetSlice, strGetSlicec, strInsertAt, strIsValidFilename, strLength, strPadZeros, strRepeat, strReplace, strSplit, strSplitCapped, strSimilarity, strStartsWith, strStripEdges, strSubstr, strUnicodeAt, strUriDecode, strUriEncode, strCmp, strGetExtension, strGetBasename, strGetBaseDir, strGetFile, strPathJoin, strSimplifyPath, strIsAbsolutePath, strIsRelativePath, strReverse, strBigramsList, strSliceCount, strRsplit, strSplitFloats, strLpad, strRpad, strPadDecimals, strTrimPrefix, strTrimSuffix, strStripEscapes, strCUnescape, strJsonEscape, strXmlEscape, strIndent, strDedent, strValidateFilename, strValidateNodeName, strWildcardMatch, strNoCaseCmp, strNaturalCaseCmp, strNaturalNoCaseCmp, strFileCaseCmp, strFileNoCaseCmp, strContainsN, strWildcardMatchN, strIsSubsequenceOf, strLstrip, strRstrip, strPascalCase, strXmlUnescape, strIsValidHtmlColor, strIsValidIpAddress, strReplaceChar, strReplaceChars, strRemoveChar, strRemoveChars, strIsValidAsciiIdentifier, strIsValidUnicodeIdentifier } from "../string-ops";
import { GBytes, utf8EncodeWtf } from "../class/bytes/packed";
import { boolArg, boolArgOr, foldInt, hexDigit, hexPairsToBytes, intArg, intArgOr } from "./core";
import { one } from "./core";
import { charReplacement, cp1252EncodeBytes } from "../class/bytes/packed-face";
import { asString } from "./core";

export function stringMethod(obj: Variant, name: string, args: Variant[]): Variant {
    const s = obj.v as string;
    const strSay = nativeAritySay("String", name, args.length);
    if (strSay !== null) throw new GodotRuntimeError("string-arity", strSay);
    switch (name) {
      case "length":
        return V.int(strLength(s));
      case "substr":
        return V.str(strSubstr(s, intArg(args, 0, "substr"), intArgOr(args, 1, -1)));
      case "left":
        return V.str(strEdge(s, intArg(args, 0, "left"), "left"));
      case "right":
        return V.str(strEdge(s, intArg(args, 0, "right"), "right"));
      case "is_empty":
        return V.bool(strLength(s) === 0);
      case "contains":
        return V.bool(strContains(s, asString(one(args, "contains"), "contains")));
      case "replace":
      case "replacen":
      case "find":
      case "findn":
      case "rfind":
      case "rfindn": {
        const min = name.startsWith("find") || name.startsWith("rfind") ? 1 : 2;
        if (args.length < min) {
          throw new GodotRuntimeError(
            "arity",
            `Too few arguments for "${name}()" call. Expected at least ${min} but received ${args.length}.`,
          );
        }
        if (args.length > 2) {
          throw new GodotRuntimeError(
            "arity",
            `Too many arguments for "${name}()" call. Expected at most 2 but received ${args.length}.`,
          );
        }
        const insensitive = name.endsWith("n");
        if (min === 2) {
          return V.str(
            strReplace(s, asString(args[0] as Variant, name), asString(args[1] as Variant, name), insensitive),
          );
        }
        const needle = asString(args[0] as Variant, name);
        const from = args.length === 2 ? intArg(args, 1, name) : name.startsWith("r") ? -1 : 0;
        return V.int(strFind(s, needle, from, name.startsWith("r"), insensitive));
      }
      case "replace_char": {
        const key = intArg(args, 0, "replace_char");
        const withCp = intArg(args, 1, "replace_char");
        if (withCp === 0) {
          stringReplaceCharNul();
          return V.str(s);
        }
        return V.str(strReplaceChar(s, key, charReplacement(withCp, "replace_char")));
      }
      case "replace_chars": {
        const keys = asString(one(args, "replace_chars"), "replace_chars");
        const withCp = intArg(args, 1, "replace_chars");
        if (withCp === 0) {
          stringReplaceCharsNul();
          return V.str(s);
        }
        return V.str(strReplaceChars(s, keys, charReplacement(withCp, "replace_chars")));
      }
      case "remove_char":
        return V.str(strRemoveChar(s, intArg(args, 0, "remove_char")));
      case "remove_chars":
        return V.str(strRemoveChars(s, asString(one(args, "remove_chars"), "remove_chars")));
      case "uri_file_decode":
        return V.str(strUriDecode(s, false));
      case "is_valid_ascii_identifier":
        return V.bool(strIsValidAsciiIdentifier(s));
      case "is_valid_unicode_identifier":
        return V.bool(strIsValidUnicodeIdentifier(s));
      case "split": {
        if (args.length > 3) {
          throw new GodotRuntimeError("arity", `split() 最多 3 个参数（收到 ${args.length} 个）`);
        }
        const allow = args[1] === undefined ? true : boolArg(args, 1, "split");
        const dm = asString(one(args, "split"), "split");
        let parts: string[];
        if (args.length === 3) {
          const mx = args[2] as Variant;
          const cap = foldInt(mx, `split() 的第 3 个参数需要 int`);
          parts = cap <= 0 ? strSplit(s, dm, allow) : strSplitCapped(s, dm, allow, cap);
        } else {
          parts = strSplit(s, dm, allow);
        }
        return V.array(GArray.of(parts.map((p) => V.str(p))));
      }
      case "to_upper":
        return V.str(strCase(s, "upper"));
      case "to_lower":
        return V.str(strCase(s, "lower"));
      case "capitalize":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `capitalize() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.str(strCapitalize(s));
      case "to_utf8_buffer": {
        if (args.length !== 0) throw new GodotRuntimeError("arity", `to_utf8_buffer() 不接受参数（收到 ${args.length} 个）`);
        return V.object(new GBytes(utf8EncodeWtf(s)));
      }
      case "to_utf16_buffer":
      case "to_wchar_buffer": {
        if (args.length !== 0) throw new GodotRuntimeError("arity", `to_${name === "to_wchar_buffer" ? "wchar" : "utf16"}_buffer() 不接受参数（收到 ${args.length} 个）`);
        const units: number[] = [];
        for (let i = 0; i < s.length; i++) {
          const cu = s.charCodeAt(i);
          units.push(cu & 0xff, (cu >>> 8) & 0xff);
        }
        return V.object(new GBytes(units));
      }
      case "to_utf32_buffer": {
        if (args.length !== 0) throw new GodotRuntimeError("arity", `to_utf32_buffer() 不接受参数（收到 ${args.length} 个）`);
        const cps: number[] = [];
        for (const ch of s) {
          const cp = ch.codePointAt(0) as number;
          cps.push(cp & 0xff, (cp >>> 8) & 0xff, (cp >>> 16) & 0xff, (cp >>> 24) & 0xff);
        }
        return V.object(new GBytes(cps));
      }
      case "to_multibyte_char_buffer": {
        if (args.length > 1) throw new GodotRuntimeError("arity", `to_multibyte_char_buffer() 最多 1 个参数（收到 ${args.length} 个）`);
        const enc = args.length === 0 ? "" : asString(args[0] as Variant, "to_multibyte_char_buffer");
        const upper = enc.toUpperCase();
        if (upper === "") {
          throw new UnsupportedError("string-multibyte-acp", "to_multibyte_char_buffer() 的空编码走宿主 ANSI 代码页（实测这台是 CP936：é→A8A6、汉→BABA），跨宿主不可复现，不发");
        }
        if (upper !== "UTF-8" && upper !== "ISO-8859-1" && upper !== "WINDOWS-1252") {
          throw new UnsupportedError("string-multibyte-encoding", `to_multibyte_char_buffer() 的编码 "${enc}" 没接（只量过 UTF-8 / ISO-8859-1 / WINDOWS-1252；引擎代码页表里其余名字没量）`);
        }
        if (s.length === 0) {
          throw new UnsupportedError("string-multibyte-empty", "to_multibyte_char_buffer() 对空串走 WideCharToMultiByte 的 Error 87 块，文案是宿主 OS 的本地化串，复现不了");
        }
        const mb: number[] = upper === "UTF-8" ? Array.from(new TextEncoder().encode(s)) : [];
        if (upper === "WINDOWS-1252") {
          const bytes = cp1252EncodeBytes(s);
          bytes.push(0);
          return V.object(new GBytes(bytes));
        }
        if (upper === "ISO-8859-1") {
          for (let i = 0; i < s.length; i++) {
            const cu = s.charCodeAt(i);
            mb.push(cu <= 0xff ? cu : 0x3f);
          }
        }
        mb.push(0);
        return V.object(new GBytes(mb));
      }
      case "to_ascii_buffer": {
        if (args.length !== 0) throw new GodotRuntimeError("arity", `to_ascii_buffer() 不接受参数（收到 ${args.length} 个）`);
        const bytes: number[] = [];
        for (const ch of s) {
          const cp = ch.codePointAt(0) as number;
          if (cp > 0x7f) {
            stringUnicodeAsciiError(cp);
            bytes.push(0x20);
          } else {
            bytes.push(cp);
          }
        }
        return V.object(new GBytes(bytes));
      }
      case "to_float":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `to_float() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.float(strToFloat(s));
      case "is_valid_float": {
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `is_valid_float() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.bool(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]*)?$/.test(s));
      }
      case "join": {
        if (args.length !== 1) {
          throw new GodotRuntimeError(
            "join-arity",
            args.length === 0
              ? `Too few arguments for "join()" call. Expected at least 1 but received 0.`
              : `Too many arguments for "join()" call. Expected at most 1 but received ${args.length}.`,
          );
        }
        const a = args[0] as Variant;
        if (a.t !== Tag.ARRAY) {
          throw new GodotRuntimeError(
            "join-arg",
            a.t === Tag.DICT
              ? `Invalid argument for "join()" function: argument 1 should be "PackedStringArray" but is "Dictionary".`
              : `Cannot pass a value of type "${tagName(a.t)}" as "PackedStringArray".`,
          );
        }
        return V.str(strJoin(s, a.v as GArray));
      }
      case "to_int":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `to_int() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.int(strToInt(s));
      case "is_valid_int":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `is_valid_int() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.bool(INT_RE.test(s));
      case "hex_to_int":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `hex_to_int() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.int(strHexToInt(s));
      case "bin_to_int":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `bin_to_int() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.int(strBinToInt(s));
      case "md5_text":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `md5_text() 不接受参数（收到 ${args.length} 个）`);
        return V.str(md5Hex(s));
      case "md5_buffer":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `md5_buffer() 不接受参数（收到 ${args.length} 个）`);
        return V.object(new GBytes(hexPairsToBytes(md5Hex(s))));
      case "sha1_text":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `sha1_text() 不接受参数（收到 ${args.length} 个）`);
        return V.str(bytesToHex(sha1Bytes(s)));
      case "sha1_buffer":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `sha1_buffer() 不接受参数（收到 ${args.length} 个）`);
        return V.object(new GBytes(sha1Bytes(s)));
      case "sha256_text":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `sha256_text() 不接受参数（收到 ${args.length} 个）`);
        return V.str(bytesToHex(sha256Bytes(s)));
      case "sha256_buffer":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `sha256_buffer() 不接受参数（收到 ${args.length} 个）`);
        return V.object(new GBytes(sha256Bytes(s)));
      case "hex_decode": {
        if (args.length !== 0) throw new GodotRuntimeError("arity", `hex_decode() 不接受参数（收到 ${args.length} 个）`);
        const cs = Array.from(s);
        if (cs.length % 2 !== 0) {
          stringHexUnevenBlock();
          return V.object(new GBytes([]));
        }
        const bytes: number[] = [];
        for (let i = 0; i < cs.length; i += 2) {
          const hi = hexDigit(cs[i] as string);
          const lo = hexDigit(cs[i + 1] as string);
          if (hi < 0 || lo < 0) {
            throw new UnsupportedError("string-hex-decode", "hex_decode() 的非法十六进制字符：引擎那两行带 U+FFFD 的怪块没复刻，响亮拒");
          }
          bytes.push(hi * 16 + lo);
        }
        return V.object(new GBytes(bytes));
      }
      case "xml_unescape":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `xml_unescape() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strXmlUnescape(s));
      case "is_valid_html_color":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `is_valid_html_color() 不接受参数（收到 ${args.length} 个）`);
        return V.bool(strIsValidHtmlColor(s));
      case "is_valid_ip_address":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `is_valid_ip_address() 不接受参数（收到 ${args.length} 个）`);
        return V.bool(strIsValidIpAddress(s));
      case "get_extension":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `get_extension() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strGetExtension(s));
      case "get_basename":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `get_basename() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strGetBasename(s));
      case "get_base_dir":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `get_base_dir() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strGetBaseDir(s));
      case "get_file":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `get_file() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strGetFile(s));
      case "path_join":
        return V.str(strPathJoin(s, asString(one(args, "path_join"), "path_join")));
      case "simplify_path":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `simplify_path() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strSimplifyPath(s));
      case "is_absolute_path":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `is_absolute_path() 不接受参数（收到 ${args.length} 个）`);
        return V.bool(strIsAbsolutePath(s));
      case "is_relative_path":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `is_relative_path() 不接受参数（收到 ${args.length} 个）`);
        return V.bool(strIsRelativePath(s));
      case "reverse":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `reverse() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strReverse(s));
      case "bigrams":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `bigrams() 不接受参数（收到 ${args.length} 个）`);
        return V.array(GArray.of(strBigramsList(s).map((x) => V.str(x))));
      case "get_slice_count":
        return V.int(strSliceCount(s, asString(one(args, "get_slice_count"), "get_slice_count")));
      case "rsplit": {
        const delim = args.length === 0 ? "" : asString(args[0] as Variant, "rsplit");
        const allow = boolArgOr(args, 1, true);
        const max = intArgOr(args, 2, 0);
        return V.array(GArray.of(strRsplit(s, delim, allow, max).map((x) => V.str(x))));
      }
      case "split_floats": {
        const delim = asString(one(args, "split_floats"), "split_floats");
        const allow = boolArgOr(args, 1, true);
        return V.array(GArray.of(strSplitFloats(s, delim, allow).map((x) => V.float(x))));
      }
      case "lpad": {
        const n = intArg(args, 0, "lpad");
        const ch = args[1] === undefined ? " " : asString(args[1] as Variant, "lpad");
        return V.str(strLpad(s, n, ch));
      }
      case "rpad": {
        const n = intArg(args, 0, "rpad");
        const ch = args[1] === undefined ? " " : asString(args[1] as Variant, "rpad");
        return V.str(strRpad(s, n, ch));
      }
      case "pad_decimals":
        return V.str(strPadDecimals(s, intArg(args, 0, "pad_decimals")));
      case "trim_prefix":
        return V.str(strTrimPrefix(s, asString(one(args, "trim_prefix"), "trim_prefix")));
      case "trim_suffix":
        return V.str(strTrimSuffix(s, asString(one(args, "trim_suffix"), "trim_suffix")));
      case "strip_escapes":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `strip_escapes() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strStripEscapes(s));
      case "c_unescape":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `c_unescape() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strCUnescape(s));
      case "json_escape":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `json_escape() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strJsonEscape(s));
      case "xml_escape":
        if (args.length > 1) throw new GodotRuntimeError("arity", `xml_escape() 最多 1 个参数（收到 ${args.length} 个）`);
        return V.str(strXmlEscape(s, args.length === 1 ? boolArg(args, 0, "xml_escape") : false));
      case "indent":
        return V.str(strIndent(s, asString(one(args, "indent"), "indent")));
      case "dedent":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `dedent() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strDedent(s));
      case "validate_filename":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `validate_filename() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strValidateFilename(s));
      case "validate_node_name":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `validate_node_name() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strValidateNodeName(s));
      case "match":
        return V.bool(strWildcardMatch(s, asString(one(args, "match"), "match")));
      case "is_valid_identifier":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `is_valid_identifier() 不接受参数（收到 ${args.length} 个）`);
        return V.bool(strIsValidAsciiIdentifier(s));
      case "nocasecmp_to":
        return V.int(strNoCaseCmp(s, asString(one(args, "nocasecmp_to"), "nocasecmp_to")));
      case "naturalcasecmp_to":
        return V.int(strNaturalCaseCmp(s, asString(one(args, "naturalcasecmp_to"), "naturalcasecmp_to")));
      case "naturalnocasecmp_to":
        return V.int(strNaturalNoCaseCmp(s, asString(one(args, "naturalnocasecmp_to"), "naturalnocasecmp_to")));
      case "filecasecmp_to":
        return V.int(strFileCaseCmp(s, asString(one(args, "filecasecmp_to"), "filecasecmp_to")));
      case "filenocasecmp_to":
        return V.int(strFileNoCaseCmp(s, asString(one(args, "filenocasecmp_to"), "filenocasecmp_to")));
      case "containsn":
        return V.bool(strContainsN(s, asString(one(args, "containsn"), "containsn")));
      case "matchn":
        return V.bool(strWildcardMatchN(s, asString(one(args, "matchn"), "matchn")));
      case "is_subsequence_of":
        return V.bool(strIsSubsequenceOf(s, asString(one(args, "is_subsequence_of"), "is_subsequence_of"), false));
      case "is_subsequence_ofn":
        return V.bool(strIsSubsequenceOf(s, asString(one(args, "is_subsequence_ofn"), "is_subsequence_ofn"), true));
      case "lstrip":
        return V.str(strLstrip(s, asString(one(args, "lstrip"), "lstrip")));
      case "rstrip":
        return V.str(strRstrip(s, asString(one(args, "rstrip"), "rstrip")));
      case "to_pascal_case":
        if (args.length !== 0) throw new GodotRuntimeError("arity", `to_pascal_case() 不接受参数（收到 ${args.length} 个）`);
        return V.str(strPascalCase(s));
      case "is_valid_hex_number": {
        if (args.length > 1) {
          throw new GodotRuntimeError("arity", `is_valid_hex_number() 最多 1 个参数（收到 ${args.length} 个）`);
        }
        const withPrefix = args.length === 1 ? boolArg(args, 0, "is_valid_hex_number") : false;
        return V.bool(withPrefix ? HEX_PREFIX_RE.test(s) : HEX_RE.test(s));
      }
      case "hash":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `hash() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.int(hashDjb2(s));
      case "begins_with":
      case "ends_with": {
        const w = asString(one(args, name), name);
        return V.bool(name === "begins_with" ? strStartsWith(s, w) : strEndsWith(s, w));
      }
      case "pad_zeros": {
        if (args.length !== 1) {
          throw new GodotRuntimeError("arity", `pad_zeros() 要 1 个参数（收到 ${args.length} 个）`);
        }
        return V.str(strPadZeros(s, intArg(args, 0, "pad_zeros")));
      }
      case "get_slicec": {
        if (args.length !== 2) {
          throw new GodotRuntimeError("arity", `get_slicec() 要 2 个参数（收到 ${args.length} 个）`);
        }
        return V.str(strGetSlicec(s, intArg(args, 0, "get_slicec"), intArg(args, 1, "get_slicec")));
      }
      case "get_slice": {
        if (args.length < 2) {
          throw new GodotRuntimeError("arity", `Too few arguments for "get_slice()" call. Expected at least 2 but received ${args.length}.`);
        }
        if (args.length > 2) {
          throw new GodotRuntimeError("arity", `Too many arguments for "get_slice()" call. Expected at most 2 but received ${args.length}.`);
        }
        return V.str(strGetSlice(s, asString(args[0] as Variant, "get_slice"), intArg(args, 1, "get_slice")));
      }
      case "insert": {
        if (args.length !== 2) {
          throw new GodotRuntimeError("arity", `insert() 要 2 个参数（收到 ${args.length} 个）`);
        }
        return V.str(strInsertAt(s, intArg(args, 0, "insert"), asString(args[1] as Variant, "insert")));
      }
      case "erase": {
        if (args.length !== 2) {
          throw new GodotRuntimeError("arity", `erase() 要 2 个参数（收到 ${args.length} 个）`);
        }
        return V.str(strEraseAt(s, intArg(args, 0, "erase"), intArg(args, 1, "erase")));
      }
      case "repeat": {
        if (args.length !== 1) {
          throw new GodotRuntimeError("arity", `repeat() 要 1 个参数（收到 ${args.length} 个）`);
        }
        return V.str(strRepeat(s, intArg(args, 0, "repeat")));
      }
      case "similarity":
        return V.float(strSimilarity(s, asString(one(args, "similarity"), "similarity")));
      case "strip_edges": {
        if (args.length > 2) {
          throw new GodotRuntimeError("arity", `Too many arguments for "strip_edges()" call. Expected at most 2 but received ${args.length}.`);
        }
        const left = args[0] === undefined ? true : boolArg(args, 0, "strip_edges");
        const right = args[1] === undefined ? true : boolArg(args, 1, "strip_edges");
        return V.str(strStripEdges(s, left, right));
      }
      case "unicode_at":
        return V.int(strUnicodeAt(s, intArg(args, 0, "unicode_at")));
      case "casecmp_to":
        return V.int(strCmp(s, asString(one(args, "casecmp_to"), "casecmp_to")));
      case "is_valid_filename": {
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `is_valid_filename() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.bool(strIsValidFilename(s));
      }
      case "uri_encode": {
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `uri_encode() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.str(strUriEncode(s));
      }
      case "uri_decode": {
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `uri_decode() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.str(strUriDecode(s));
      }
      case "c_escape": {
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `c_escape() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.str(strCEscape(s));
      }
      case "to_camel_case":
      case "to_kebab_case":
      case "to_snake_case": {
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `${name}() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.str(strCaseStyle(s, name === "to_camel_case" ? "camel" : name === "to_kebab_case" ? "kebab" : "snake"));
      }
      case "count":
      case "countn": {
        if (args.length < 1) {
          throw new GodotRuntimeError("arity", `Too few arguments for "${name}()" call. Expected at least 1 but received ${args.length}.`);
        }
        if (args.length > 3) {
          throw new GodotRuntimeError("arity", `Too many arguments for "${name}()" call. Expected at most 3 but received ${args.length}.`);
        }
        const from = args.length >= 2 ? intArg(args, 1, name) : 0;
        const to = args.length >= 3 ? intArg(args, 2, name) : 0;
        return V.int(strCount(s, asString(args[0] as Variant, name), name === "countn", from, to));
      }
      case "format": {
        if (args.length < 1) {
          throw new GodotRuntimeError("arity", `Too few arguments for "format()" call. Expected at least 1 but received ${args.length}.`);
        }
        if (args.length > 2) {
          throw new GodotRuntimeError("arity", `Too many arguments for "format()" call. Expected at most 2 but received ${args.length}.`);
        }
        const ph = args.length >= 2 ? asString(args[1] as Variant, "format") : "{_}";
        const vals = args[0] as Variant;
        if (!(vals.t === Tag.ARRAY || vals.t === Tag.DICT || (vals.t === Tag.OBJECT && vals.v instanceof GdScriptObject))) {
          stringFormatInvalidType();
        }
        return V.str(strFormatV(s, vals, ph));
      }
      case "md5_text":
        if (args.length !== 0) {
          throw new GodotRuntimeError("arity", `md5_text() 不接受参数（收到 ${args.length} 个）`);
        }
        return V.str(md5Hex(s));
      default:
        if (!faceMemberKnown("String", name)) {
          throw new GodotRuntimeError("string-no-method", `Invalid call. Nonexistent function '${name}' in base 'String'.`);
        }
        throw new UnsupportedError("string-method", `String.${name}() 未实现`);
    }
}
