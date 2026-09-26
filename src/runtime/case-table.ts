/**
 * Godot 与 JS 的大小写映射**不一致**的码点表 —— 生成物，别手改，改请重跑生成流程。
 *
 *   node tools/case-probe.mjs
 *   node tools/golden.mjs 000-probe-cs
 *   node tools/case-table.mjs
 *
 * 数据来自 3037 个码点（= JS 里存在大小写映射的全部码点，BMP 与卫星平面都算）
 * 在 Godot 4.6.3 下的实测结果；其中 2878 个与 JS 一致、不需要进表。
 * 两条实测出来的规律，运行时就按它们设计：
 *  - Godot 的 to_upper/to_lower **永不撑开**（3037 个码点里 0 个多码点结果），
 *    所以「JS 结果长度变了吗」可以当作「需不需要查表」的筛子；
 *  - 反过来，JS 与 Godot 都给单码点却**给的不是同一个字符**的情况真实存在
 *    （Bassa Vah U+16EA0…U+16ED3 整段、U+A7CE…U+A7D5：Godot 视为无大小写），
 *    所以不能只处理"撑开"那一类，必须整段对账 —— 这张表就是对账的产物。
 * 未在表内且 JS 也没撑开的码点：JS 的单码点结果与 Godot 实测相同（本轮已全量验证）。
 */

export const CASE_UPPER_FIX: Readonly<Record<string, string>> = {
  "\u00DF": "\u00DF", // U+00DF to_upper
  "\u0149": "\u0149", // U+0149 to_upper
  "\u01F0": "\u01F0", // U+01F0 to_upper
  "\u0390": "\u0390", // U+0390 to_upper
  "\u03B0": "\u03B0", // U+03B0 to_upper
  "\u0587": "\u0587", // U+0587 to_upper
  "\u1E96": "\u1E96", // U+1E96 to_upper
  "\u1E97": "\u1E97", // U+1E97 to_upper
  "\u1E98": "\u1E98", // U+1E98 to_upper
  "\u1E99": "\u1E99", // U+1E99 to_upper
  "\u1E9A": "\u1E9A", // U+1E9A to_upper
  "\u1F50": "\u1F50", // U+1F50 to_upper
  "\u1F52": "\u1F52", // U+1F52 to_upper
  "\u1F54": "\u1F54", // U+1F54 to_upper
  "\u1F56": "\u1F56", // U+1F56 to_upper
  "\u1F80": "\u1F88", // U+1F80 to_upper
  "\u1F81": "\u1F89", // U+1F81 to_upper
  "\u1F82": "\u1F8A", // U+1F82 to_upper
  "\u1F83": "\u1F8B", // U+1F83 to_upper
  "\u1F84": "\u1F8C", // U+1F84 to_upper
  "\u1F85": "\u1F8D", // U+1F85 to_upper
  "\u1F86": "\u1F8E", // U+1F86 to_upper
  "\u1F87": "\u1F8F", // U+1F87 to_upper
  "\u1F88": "\u1F88", // U+1F88 to_upper
  "\u1F89": "\u1F89", // U+1F89 to_upper
  "\u1F8A": "\u1F8A", // U+1F8A to_upper
  "\u1F8B": "\u1F8B", // U+1F8B to_upper
  "\u1F8C": "\u1F8C", // U+1F8C to_upper
  "\u1F8D": "\u1F8D", // U+1F8D to_upper
  "\u1F8E": "\u1F8E", // U+1F8E to_upper
  "\u1F8F": "\u1F8F", // U+1F8F to_upper
  "\u1F90": "\u1F98", // U+1F90 to_upper
  "\u1F91": "\u1F99", // U+1F91 to_upper
  "\u1F92": "\u1F9A", // U+1F92 to_upper
  "\u1F93": "\u1F9B", // U+1F93 to_upper
  "\u1F94": "\u1F9C", // U+1F94 to_upper
  "\u1F95": "\u1F9D", // U+1F95 to_upper
  "\u1F96": "\u1F9E", // U+1F96 to_upper
  "\u1F97": "\u1F9F", // U+1F97 to_upper
  "\u1F98": "\u1F98", // U+1F98 to_upper
  "\u1F99": "\u1F99", // U+1F99 to_upper
  "\u1F9A": "\u1F9A", // U+1F9A to_upper
  "\u1F9B": "\u1F9B", // U+1F9B to_upper
  "\u1F9C": "\u1F9C", // U+1F9C to_upper
  "\u1F9D": "\u1F9D", // U+1F9D to_upper
  "\u1F9E": "\u1F9E", // U+1F9E to_upper
  "\u1F9F": "\u1F9F", // U+1F9F to_upper
  "\u1FA0": "\u1FA8", // U+1FA0 to_upper
  "\u1FA1": "\u1FA9", // U+1FA1 to_upper
  "\u1FA2": "\u1FAA", // U+1FA2 to_upper
  "\u1FA3": "\u1FAB", // U+1FA3 to_upper
  "\u1FA4": "\u1FAC", // U+1FA4 to_upper
  "\u1FA5": "\u1FAD", // U+1FA5 to_upper
  "\u1FA6": "\u1FAE", // U+1FA6 to_upper
  "\u1FA7": "\u1FAF", // U+1FA7 to_upper
  "\u1FA8": "\u1FA8", // U+1FA8 to_upper
  "\u1FA9": "\u1FA9", // U+1FA9 to_upper
  "\u1FAA": "\u1FAA", // U+1FAA to_upper
  "\u1FAB": "\u1FAB", // U+1FAB to_upper
  "\u1FAC": "\u1FAC", // U+1FAC to_upper
  "\u1FAD": "\u1FAD", // U+1FAD to_upper
  "\u1FAE": "\u1FAE", // U+1FAE to_upper
  "\u1FAF": "\u1FAF", // U+1FAF to_upper
  "\u1FB2": "\u1FB2", // U+1FB2 to_upper
  "\u1FB3": "\u1FBC", // U+1FB3 to_upper
  "\u1FB4": "\u1FB4", // U+1FB4 to_upper
  "\u1FB6": "\u1FB6", // U+1FB6 to_upper
  "\u1FB7": "\u1FB7", // U+1FB7 to_upper
  "\u1FBC": "\u1FBC", // U+1FBC to_upper
  "\u1FC2": "\u1FC2", // U+1FC2 to_upper
  "\u1FC3": "\u1FCC", // U+1FC3 to_upper
  "\u1FC4": "\u1FC4", // U+1FC4 to_upper
  "\u1FC6": "\u1FC6", // U+1FC6 to_upper
  "\u1FC7": "\u1FC7", // U+1FC7 to_upper
  "\u1FCC": "\u1FCC", // U+1FCC to_upper
  "\u1FD2": "\u1FD2", // U+1FD2 to_upper
  "\u1FD3": "\u1FD3", // U+1FD3 to_upper
  "\u1FD6": "\u1FD6", // U+1FD6 to_upper
  "\u1FD7": "\u1FD7", // U+1FD7 to_upper
  "\u1FE2": "\u1FE2", // U+1FE2 to_upper
  "\u1FE3": "\u1FE3", // U+1FE3 to_upper
  "\u1FE4": "\u1FE4", // U+1FE4 to_upper
  "\u1FE6": "\u1FE6", // U+1FE6 to_upper
  "\u1FE7": "\u1FE7", // U+1FE7 to_upper
  "\u1FF2": "\u1FF2", // U+1FF2 to_upper
  "\u1FF3": "\u1FFC", // U+1FF3 to_upper
  "\u1FF4": "\u1FF4", // U+1FF4 to_upper
  "\u1FF6": "\u1FF6", // U+1FF6 to_upper
  "\u1FF7": "\u1FF7", // U+1FF7 to_upper
  "\u1FFC": "\u1FFC", // U+1FFC to_upper
  "\uA7CF": "\uA7CF", // U+A7CF to_upper
  "\uA7D3": "\uA7D3", // U+A7D3 to_upper
  "\uA7D5": "\uA7D5", // U+A7D5 to_upper
  "\uFB00": "\uFB00", // U+FB00 to_upper
  "\uFB01": "\uFB01", // U+FB01 to_upper
  "\uFB02": "\uFB02", // U+FB02 to_upper
  "\uFB03": "\uFB03", // U+FB03 to_upper
  "\uFB04": "\uFB04", // U+FB04 to_upper
  "\uFB05": "\uFB05", // U+FB05 to_upper
  "\uFB06": "\uFB06", // U+FB06 to_upper
  "\uFB13": "\uFB13", // U+FB13 to_upper
  "\uFB14": "\uFB14", // U+FB14 to_upper
  "\uFB15": "\uFB15", // U+FB15 to_upper
  "\uFB16": "\uFB16", // U+FB16 to_upper
  "\uFB17": "\uFB17", // U+FB17 to_upper
  "\u{16EBB}": "\u{16EBB}", // U+16EBB to_upper
  "\u{16EBC}": "\u{16EBC}", // U+16EBC to_upper
  "\u{16EBD}": "\u{16EBD}", // U+16EBD to_upper
  "\u{16EBE}": "\u{16EBE}", // U+16EBE to_upper
  "\u{16EBF}": "\u{16EBF}", // U+16EBF to_upper
  "\u{16EC0}": "\u{16EC0}", // U+16EC0 to_upper
  "\u{16EC1}": "\u{16EC1}", // U+16EC1 to_upper
  "\u{16EC2}": "\u{16EC2}", // U+16EC2 to_upper
  "\u{16EC3}": "\u{16EC3}", // U+16EC3 to_upper
  "\u{16EC4}": "\u{16EC4}", // U+16EC4 to_upper
  "\u{16EC5}": "\u{16EC5}", // U+16EC5 to_upper
  "\u{16EC6}": "\u{16EC6}", // U+16EC6 to_upper
  "\u{16EC7}": "\u{16EC7}", // U+16EC7 to_upper
  "\u{16EC8}": "\u{16EC8}", // U+16EC8 to_upper
  "\u{16EC9}": "\u{16EC9}", // U+16EC9 to_upper
  "\u{16ECA}": "\u{16ECA}", // U+16ECA to_upper
  "\u{16ECB}": "\u{16ECB}", // U+16ECB to_upper
  "\u{16ECC}": "\u{16ECC}", // U+16ECC to_upper
  "\u{16ECD}": "\u{16ECD}", // U+16ECD to_upper
  "\u{16ECE}": "\u{16ECE}", // U+16ECE to_upper
  "\u{16ECF}": "\u{16ECF}", // U+16ECF to_upper
  "\u{16ED0}": "\u{16ED0}", // U+16ED0 to_upper
  "\u{16ED1}": "\u{16ED1}", // U+16ED1 to_upper
  "\u{16ED2}": "\u{16ED2}", // U+16ED2 to_upper
  "\u{16ED3}": "\u{16ED3}", // U+16ED3 to_upper
};

export const CASE_LOWER_FIX: Readonly<Record<string, string>> = {
  "\u0130": "\u0069", // U+0130 to_lower
  "\uA7CE": "\uA7CE", // U+A7CE to_lower
  "\uA7D2": "\uA7D2", // U+A7D2 to_lower
  "\uA7D4": "\uA7D4", // U+A7D4 to_lower
  "\u{16EA0}": "\u{16EA0}", // U+16EA0 to_lower
  "\u{16EA1}": "\u{16EA1}", // U+16EA1 to_lower
  "\u{16EA2}": "\u{16EA2}", // U+16EA2 to_lower
  "\u{16EA3}": "\u{16EA3}", // U+16EA3 to_lower
  "\u{16EA4}": "\u{16EA4}", // U+16EA4 to_lower
  "\u{16EA5}": "\u{16EA5}", // U+16EA5 to_lower
  "\u{16EA6}": "\u{16EA6}", // U+16EA6 to_lower
  "\u{16EA7}": "\u{16EA7}", // U+16EA7 to_lower
  "\u{16EA8}": "\u{16EA8}", // U+16EA8 to_lower
  "\u{16EA9}": "\u{16EA9}", // U+16EA9 to_lower
  "\u{16EAA}": "\u{16EAA}", // U+16EAA to_lower
  "\u{16EAB}": "\u{16EAB}", // U+16EAB to_lower
  "\u{16EAC}": "\u{16EAC}", // U+16EAC to_lower
  "\u{16EAD}": "\u{16EAD}", // U+16EAD to_lower
  "\u{16EAE}": "\u{16EAE}", // U+16EAE to_lower
  "\u{16EAF}": "\u{16EAF}", // U+16EAF to_lower
  "\u{16EB0}": "\u{16EB0}", // U+16EB0 to_lower
  "\u{16EB1}": "\u{16EB1}", // U+16EB1 to_lower
  "\u{16EB2}": "\u{16EB2}", // U+16EB2 to_lower
  "\u{16EB3}": "\u{16EB3}", // U+16EB3 to_lower
  "\u{16EB4}": "\u{16EB4}", // U+16EB4 to_lower
  "\u{16EB5}": "\u{16EB5}", // U+16EB5 to_lower
  "\u{16EB6}": "\u{16EB6}", // U+16EB6 to_lower
  "\u{16EB7}": "\u{16EB7}", // U+16EB7 to_lower
  "\u{16EB8}": "\u{16EB8}", // U+16EB8 to_lower
};
