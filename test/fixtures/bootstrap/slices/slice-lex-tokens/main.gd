extends SceneTree

const PUNCT = ["==", "!=", ">=", "<=", "+=", "-=", "*=", "/=", "&&", "||", "=", "+", "-", "*", "/", "%", "(", ")", "[", "]", "{", "}", ",", ":", ".", ";", "|", "&", "<", ">"]
const TAB_WIDTH = 8

func _initialize():
	case("var x = 42\nfunc f(a):\n\treturn \"hi\"\t# tail\n")
	case("a1 = 3.5\n\tif b>=c:\n\t\tprint(2)\n")
	case("#region 标题\nvar s = 'it\\'s' + r'\\n'\n#endregion\n")
	case("!!\n")
	quit()


func case(src):
	print("== 长度 ", src.length())
	var toks = lex(src)
	for t in toks:
		print("tk|", t["kind"], "|", t["start"], "|", t["end"], "|", t["row"], "|", t["col"], "|", t["lineStart"], "|", t["indent"], "|", t["text"])


func is_digit(c):
	return c >= "0" and c <= "9"


func is_ident_start(c):
	return c == "_" or (c >= "a" and c <= "z") or (c >= "A" and c <= "Z")


func is_ident_part(c):
	return is_ident_start(c) or is_digit(c)


func push_tok(tokens, src, kind, start, end, row, line_start, fresh, indent):
	tokens.append({
		"kind": kind,
		"text": src.substr(start, end - start),
		"start": start,
		"end": end,
		"row": row,
		"col": start - line_start,
		"lineStart": fresh,
		"indent": indent,
	})


func lex(src):
	var tokens = []
	var n = src.length()
	var i = 0
	var row = 0
	var line_start = 0
	var fresh = true
	var indent = 0
	while i < n:
		var c = src[i]
		if c == "\n":
			i += 1
			row += 1
			line_start = i
			fresh = true
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
		if c == "\r":
			if fresh:
				indent = 0
			i += 1
			continue
		if c == "#":
			var j = i
			while j < n and src[j] != "\n":
				j += 1
			var whole = src.substr(i, j - i)
			if whole.begins_with("#endregion"):
				push_tok(tokens, src, "region-end", i, j, row, line_start, fresh, indent)
			elif whole.begins_with("#region"):
				push_tok(tokens, src, "region-start", i, i + 7, row, line_start, fresh, indent)
				if j > i + 7:
					push_tok(tokens, src, "region-label", i + 7, j, row, line_start, false, indent)
			else:
				push_tok(tokens, src, "comment", i, j, row, line_start, fresh, indent)
			i = j
			fresh = false
			continue
		if c == "\"" or c == "'" or (c == "r" and i + 1 < n and (src[i + 1] == "\"" or src[i + 1] == "'")):
			var raw = c == "r"
			var q = src[i + 1] if raw else c
			var head = i + 1 if raw else i
			push_tok(tokens, src, "str-start", i, head + 1, row, line_start, fresh, indent)
			fresh = false
			var k = head + 1
			while k < n:
				var d = src[k]
				if d == "\\" and not raw:
					push_tok(tokens, src, "escape", k, k + 2, row, line_start, false, indent)
					k += 2
					continue
				if d == q:
					push_tok(tokens, src, "str-end", k, k + 1, row, line_start, false, indent)
					k += 1
					break
				k += 1
			i = k
			continue
		if is_ident_start(c):
			var a = i + 1
			while a < n and is_ident_part(src[a]):
				a += 1
			push_tok(tokens, src, "ident", i, a, row, line_start, fresh, indent)
			i = a
			fresh = false
			continue
		if is_digit(c):
			var b = i
			while b < n and is_digit(src[b]):
				b += 1
			if b < n and src[b] == "." and b + 1 < n and is_digit(src[b + 1]):
				b += 1
				while b < n and is_digit(src[b]):
					b += 1
				push_tok(tokens, src, "float", i, b, row, line_start, fresh, indent)
			else:
				push_tok(tokens, src, "int", i, b, row, line_start, fresh, indent)
			i = b
			fresh = false
			continue
		var hit = ""
		for p in PUNCT:
			if src.substr(i, p.length()) == p:
				hit = p
				break
		if hit != "":
			push_tok(tokens, src, "punct", i, i + hit.length(), row, line_start, fresh, indent)
			i += hit.length()
			fresh = false
			continue
		i += 1
		fresh = false
	push_tok(tokens, src, "eof", n, n, row, line_start, fresh, indent)
	return tokens
