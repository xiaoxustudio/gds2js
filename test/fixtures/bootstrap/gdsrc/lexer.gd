const T = preload("res://tokens.gd")


class Scanner:
	var starts = []
	var tokens = []
	var issues = []
	var src = ""
	var fresh = true
	var indent = 0

	func run(text):
		src = text
		starts = build_lines(src)
		tokens = []
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
			if c == "\\" and (ch(i + 1) == "\n" or (ch(i + 1) == "\r" and ch(i + 2) == "\n")):
				var fin = i + 2
				if ch(i + 1) == "\r":
					fin = i + 3
				push("cont", i, fin)
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
					indent += T.TAB_WIDTH
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
				i = scan_comment(i)
				continue
			var delim = read_delim(i)
			if delim != {}:
				i = scan_string(delim)
				continue
			if T.is_ident_start(c):
				var a = i + 1
				while a < n and T.is_ident_part(src[a]):
					a += 1
				push("ident", i, a)
				i = a
				continue
			if T.is_digit(c):
				var num = number_end(i)
				push(num["kind"], i, num["end"])
				i = num["end"]
				continue
			if c == ".":
				var dn = dot_number_end(i)
				if dn > 0:
					push("float", i, dn)
					i = dn
					continue
			var hit = T.punct_at(src, i)
			if hit != "":
				push("punct", i, i + hit.length())
				i += hit.length()
				continue
			fail(i, "无法识别的字符 [" + c + "]")
			i += 1
			fresh = false
		push("eof", n, n)

	func ch(i):
		if i < 0 or i >= src.length():
			return ""
		return src[i]

	func is_zero_width(c):
		return c == "﻿" or c == "⁠" or c == "​"

	func is_hex(c):
		return T.is_digit(c) or (c >= "a" and c <= "f") or (c >= "A" and c <= "F")

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

	func run_of(at, count, kind):
		var i = at
		var seen = 0
		var n = src.length()
		while seen < count and i < n and is_radix(kind, src[i]):
			i += 1
			seen += 1
		if seen == count:
			return i
		return -1

	func escape_end(backslash):
		if backslash + 1 >= src.length():
			return -1
		var c = src[backslash + 1]
		if c == "u":
			return run_of(backslash + 2, 4, "hex")
		if c == "U":
			return run_of(backslash + 2, 6, "hex")
		if c == "x":
			return run_of(backslash + 2, 2, "hex")
		if c == "o":
			return run_of(backslash + 2, 3, "oct")
		if c == "\r":
			if ch(backslash + 2) == "\n":
				return backslash + 3
			return -1
		return backslash + 2

	func digits(i):
		var n = src.length()
		var j = i
		while true:
			var k = j
			while k < n and T.is_digit(src[k]):
				k += 1
			if k == j:
				return j
			if ch(k) == "_":
				k += 1
			j = k

	func number_end(at):
		var n = src.length()
		if ch(at) == "0":
			var p = ch(at + 1)
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
					if ch(k) == "_":
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
		var i = digits(at)
		var is_float = false
		if ch(i) == "." and ch(i + 1) != ".":
			is_float = true
			i = digits(i + 1)
		var e = ch(i)
		if e == "e" or e == "E":
			var j2 = i + 1
			if ch(j2) == "+" or ch(j2) == "-":
				j2 += 1
			var after = digits(j2)
			if after > j2:
				is_float = true
				i = after
		if is_float:
			return {"end": i, "kind": "float"}
		return {"end": i, "kind": "int"}

	func dot_number_end(at):
		var i = digits(at + 1)
		if i == at + 1:
			return -1
		var e = ch(i)
		if e == "e" or e == "E":
			var j = i + 1
			if ch(j) == "+" or ch(j) == "-":
				j += 1
			var after = digits(j)
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

	func read_delim(at):
		var i = at
		var flag = str_prefix(ch(i))
		if flag != "":
			i += 1
		var q = ch(i)
		if q != "\"" and q != "'":
			return {}
		var triple = ch(i + 1) == q and ch(i + 2) == q
		var body = 1
		if triple:
			body = 3
		return {"quote": q, "triple": triple, "raw": flag == "raw", "head": i, "body": body, "from": at}

	func build_lines(text):
		var out = [0]
		var n = text.length()
		for k in n:
			if text[k] == "\n":
				out.append(k + 1)
		return out

	func row_of(idx):
		var lo = 0
		var hi = starts.size() - 1
		while lo < hi:
			var mid = (lo + hi + 1) >> 1
			if starts[mid] <= idx:
				lo = mid
			else:
				hi = mid - 1
		return lo

	func push(kind, start, end):
		var r = row_of(start)
		tokens.append({
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

	func fail(at, message):
		var r = row_of(at)
		issues.append({"at": at, "row": r, "col": at - starts[r], "message": message})

	func scan_comment(i):
		var n = src.length()
		var j = i
		while j < n and src[j] != "\n":
			j += 1
		var whole = src.substr(i, j - i)
		if whole.begins_with("#endregion"):
			push("region-end", i, j)
		elif whole.begins_with("#region"):
			push("region-start", i, i + 7)
			if j > i + 7:
				push("region-label", i + 7, j)
		else:
			push("comment", i, j)
		return j

	func scan_string(delim):
		var quote = delim["quote"]
		var triple = delim["triple"]
		var raw = delim["raw"]
		var from = delim["from"]
		var head = delim["head"]
		var body = delim["body"]
		push("str-start", from, head + body)
		var i = head + body
		var n = src.length()
		var closed = false
		while i < n:
			var c = src[i]
			if c == "\\" and not raw:
				var end = escape_end(i)
				if end < 0:
					fail(i, "字符串里的转义 \\" + ch(i + 1) + " 不合法")
					i += 1
					continue
				push("escape", i, end)
				i = end
				continue
			if c == "\\" and raw:
				var nx = ch(i + 1)
				if nx == quote or nx == "\\":
					i += 2
				else:
					i += 1
				continue
			if c == quote:
				if not triple:
					push("str-end", i, i + 1)
					i += 1
					closed = true
					break
				if ch(i + 1) == quote and ch(i + 2) == quote:
					push("str-end", i, i + 3)
					i += 3
					closed = true
					break
				i += 1
				continue
			i += 1
		if not closed:
			fail(from, "字符串没有闭合")
		return i


static func lex(text):
	var s = Scanner.new()
	s.run(text)
	return {"tokens": s.tokens, "issues": s.issues}
