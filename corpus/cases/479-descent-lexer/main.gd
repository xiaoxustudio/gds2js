extends SceneTree

const TAB_WIDTH = 8
const PUNCT = ["**=", "<<=", ">>=", "**", "<<", ">>", ":=", "->", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<=", ">=", "==", "!=", "&&", "||", "..", "(", ")", "[", "]", "{", "}", ",", ":", ";", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "~", "!", "<", ">", "@", "$"]

var starts = []
var toks = []
var issues = []
var fresh = true
var indent = 0


func _initialize():
	show("s01", "var x = 42\nfunc f(a):\n\treturn \"hi\"\t# tail\n")
	show("s02", "a1 = 3.5\n\tif b>=c:\n\t\tprint(2)\n")
	show("s03", "#region 标题\nx = 1\n#endregion\n")
	show("s04", "0x1F 0b1010 0o17 1_000 3.5e-3 .5 1. 1..2 2 **= 3 super._init()\n")
	show("s05", "r\"C:\\tmp\" &\"NodeName\" ^\"A/B\" @\"C\"\n")
	show("s06", "\"a\\u00e9b\" \"c\\U0001F600d\" \"e\\\\f\" \"g\\x41h\" \"i\\o101j\"\n")
	show("s07", "\"\"\"triple\nline\"\"\" '''single-triple'''\n")
	show("s08", "nope = \"unclosed\n")
	show("s09", "bad = \"a\\qb\"\n")
	show("s10", "cont = 1 + \\\n\t2\n")
	show("s11", "zwm = ﻿1 + ​2
")
	show("s12", "abé = 1
中文 = 2
")
	show("s13", "\U0001F600 = 1\n")
	show("s14", "\t\tx = 1\n        y = 2\n")
	show("s15", "&\"\"\"named-triple\"\"\"\n")
	show("s16", "a << b >> c <= d >= e != f == g\n")
	show("s17", "\\\n\n")
	show("s18", "s = \"\n\"\n")
	quit()


func show(tag, src):
	print("case|", tag, "|", src.length())
	lex(src)
	for t in toks:
		print("tk|", t["kind"], "|", t["start"], "|", t["end"], "|", t["row"], "|", t["col"], "|", t["lineStart"], "|", t["indent"], "|", t["text"])
	for e in issues:
		print("is|", e["at"], "|", e["row"], "|", e["col"], "|", e["message"])


func is_digit(c):
	return c >= "0" and c <= "9"


func is_hex(c):
	return is_digit(c) or (c >= "a" and c <= "f") or (c >= "A" and c <= "F")


func is_oct(c):
	return c >= "0" and c <= "7"


func is_bin(c):
	return c == "0" or c == "1"


func is_radix(kind, c):
	if kind == "hex":
		return is_hex(c)
	if kind == "oct":
		return is_oct(c)
	return is_bin(c)


func in_xid(c):
	if c.length() == 0:
		return false
	var u = c.unicode_at(0)
	if u >= 0xC0 and u <= 0xD6:
		return true
	if u >= 0xD8 and u <= 0xF6:
		return true
	if u >= 0xF8 and u <= 0xFF:
		return true
	if u >= 0x370 and u <= 0x3FF:
		return true
	if u >= 0x400 and u <= 0x4FF:
		return true
	if u >= 0x3040 and u <= 0x30FF:
		return true
	if u >= 0x4E00 and u <= 0x9FFF:
		return true
	return false


func is_ident_start(c):
	return c == "_" or (c >= "a" and c <= "z") or (c >= "A" and c <= "Z") or in_xid(c)


func is_ident_part(c):
	return c == "_" or is_digit(c) or (c >= "a" and c <= "z") or (c >= "A" and c <= "Z") or in_xid(c)


func is_zero_width(c):
	return c == "﻿" or c == "⁠" or c == "​"


func ch(src, i):
	if i < 0 or i >= src.length():
		return ""
	return src[i]


func line_table(src):
	var out = [0]
	var n = src.length()
	for i in n:
		if src[i] == "\n":
			out.append(i + 1)
	return out


func row_of(at_starts, idx):
	var lo = 0
	var hi = at_starts.size() - 1
	while lo < hi:
		var mid = (lo + hi + 1) >> 1
		if at_starts[mid] <= idx:
			lo = mid
		else:
			hi = mid - 1
	return lo


func run_of(src, at, count, kind):
	var i = at
	var seen = 0
	var n = src.length()
	while seen < count and i < n and is_radix(kind, src[i]):
		i += 1
		seen += 1
	if seen == count:
		return i
	return -1


func escape_end(src, backslash):
	if backslash + 1 >= src.length():
		return -1
	var c = src[backslash + 1]
	if c == "u":
		return run_of(src, backslash + 2, 4, "hex")
	if c == "U":
		return run_of(src, backslash + 2, 6, "hex")
	if c == "x":
		return run_of(src, backslash + 2, 2, "hex")
	if c == "o":
		return run_of(src, backslash + 2, 3, "oct")
	if c == "\r":
		if src[backslash + 2] == "\n":
			return backslash + 3
		return -1
	return backslash + 2


func digits(src, i):
	var n = src.length()
	var j = i
	while true:
		var k = j
		while k < n and is_digit(src[k]):
			k += 1
		if k == j:
			return j
		if src[k] == "_":
			k += 1
		j = k


func number_end(src, at):
	var n = src.length()
	if ch(src, at) == "0":
		var p = ch(src, at + 1)
		var radix = ""
		if p == "x" or p == "X":
			radix = "hex"
		elif p == "o" or p == "O":
			radix = "oct"
		elif p == "b" or p == "B":
			radix = "bin"
		if radix != "":
			var j = at + 2
			var reps = 0
			while true:
				var k = j
				if ch(src, k) == "_":
					k += 1
				var d = k
				while d < n and is_radix(radix, src[d]):
					d += 1
				if d == k:
					break
				j = d
				reps += 1
			if reps > 0:
				return {"end": j, "kind": "int"}
	var i = digits(src, at)
	var is_float = false
	if ch(src, i) == "." and ch(src, i + 1) != ".":
		is_float = true
		i = digits(src, i + 1)
	var e = ch(src, i)
	if e == "e" or e == "E":
		var j2 = i + 1
		if ch(src, j2) == "+" or ch(src, j2) == "-":
			j2 += 1
		var after = digits(src, j2)
		if after > j2:
			is_float = true
			i = after
	if is_float:
		return {"end": i, "kind": "float"}
	return {"end": i, "kind": "int"}


func dot_number_end(src, at):
	var i = digits(src, at + 1)
	if i == at + 1:
		return -1
	var e = ch(src, i)
	if e == "e" or e == "E":
		var j = i + 1
		if ch(src, j) == "+" or ch(src, j) == "-":
			j += 1
		var after = digits(src, j)
		if after > j:
			i = after
	return i


func str_prefix(c):
	if c == "r":
		return "raw"
	if c == "&":
		return "name"
	if c == "^":
		return "nodePath"
	if c == "@":
		return "nodePath"
	return ""


func read_delim(src, at):
	var i = at
	var flag = str_prefix(ch(src, i))
	if flag != "":
		i += 1
	var q = ch(src, i)
	if q != "\"" and q != "'":
		return {}
	var triple = ch(src, i + 1) == q and ch(src, i + 2) == q
	var body = 1
	if triple:
		body = 3
	return {"quote": q, "triple": triple, "raw": flag == "raw", "head": i, "body": body}


func push_tok(kind, src, start, end):
	var r = row_of(starts, start)
	toks.append({
		"kind": kind,
		"text": src.substr(start, end - start),
		"start": start,
		"end": end,
		"row": r,
		"col": start - starts[r],
		"lineStart": fresh,
		"indent": indent,
	})
	fresh = false


func push_issue(at, message):
	var r = row_of(starts, at)
	issues.append({"at": at, "row": r, "col": at - starts[r], "message": message})


func lex(src):
	starts = line_table(src)
	toks = []
	issues = []
	fresh = true
	indent = 0
	var n = src.length()
	var i = 0
	while i < n:
		var c = src[i]
		if c == "\n":
			i += 1
			fresh = true
			indent = 0
			continue
		if c == "\\" and (ch(src, i + 1) == "\n" or (ch(src, i + 1) == "\r" and ch(src, i + 2) == "\n")):
			var fin = i + 2
			if ch(src, i + 1) == "\r":
				fin = i + 3
			push_tok("cont", src, i, fin)
			i = fin
			indent = 0
			continue
		if c == " ":
			if fresh:
				indent += 1
			i += 1
			continue
		if c == "\t":
			if fresh:
				indent += TAB_WIDTH
			i += 1
			continue
		if c == "\r" or c == "\f":
			if fresh:
				indent = 0
			i += 1
			continue
		if is_zero_width(c):
			i += 1
			continue
		if c == "#":
			var j = i
			while j < n and src[j] != "\n":
				j += 1
			var whole = src.substr(i, j - i)
			if whole.begins_with("#endregion"):
				push_tok("region-end", src, i, j)
			elif whole.begins_with("#region"):
				push_tok("region-start", src, i, i + 7)
				if j > i + 7:
					push_tok("region-label", src, i + 7, j)
			else:
				push_tok("comment", src, i, j)
			i = j
			continue
		var delim = read_delim(src, i)
		if delim != {}:
			i = lex_string(src, delim, i)
			continue
		if is_ident_start(c):
			var a = i + 1
			while a < n and is_ident_part(src[a]):
				a += 1
			push_tok("ident", src, i, a)
			i = a
			continue
		if is_digit(c):
			var num = number_end(src, i)
			push_tok(num["kind"], src, i, num["end"])
			i = num["end"]
			continue
		if c == ".":
			var dn = dot_number_end(src, i)
			if dn > 0:
				push_tok("float", src, i, dn)
				i = dn
				continue
		var hit = ""
		for p in PUNCT:
			if src.substr(i, p.length()) == p:
				hit = p
				break
		if hit != "":
			push_tok("punct", src, i, i + hit.length())
			i += hit.length()
			continue
		push_issue(i, "无法识别的字符 [" + c + "]")
		i += 1
		fresh = false
	var eof_row = row_of(starts, n)
	push_tok("eof", src, n, n)


func lex_string(src, delim, from):
	var quote = delim["quote"]
	var triple = delim["triple"]
	var raw = delim["raw"]
	var head = delim["head"]
	var body = delim["body"]
	push_tok("str-start", src, from, head + body)
	var i = head + body
	var n = src.length()
	var closed = false
	while i < n:
		var c = src[i]
		if c == "\\" and not raw:
			var end = escape_end(src, i)
			if end < 0:
				push_issue(i, "字符串里的转义 \\" + ch(src, i + 1) + " 不合法")
				i += 1
				continue
			push_tok("escape", src, i, end)
			i = end
			continue
		if c == "\\" and raw:
			var nx = ch(src, i + 1)
			if nx == quote or nx == "\\":
				i += 2
			else:
				i += 1
			continue
		if c == quote:
			if not triple:
				push_tok("str-end", src, i, i + 1)
				i += 1
				closed = true
				break
			if ch(src, i + 1) == quote and ch(src, i + 2) == quote:
				push_tok("str-end", src, i, i + 3)
				i += 3
				closed = true
				break
			i += 1
			continue
		i += 1
	if not closed:
		push_issue(from, "字符串没有闭合")
	return i
