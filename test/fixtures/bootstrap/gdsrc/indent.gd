const L = preload("res://lexer.gd")


class LineSpan:
	var row = 0
	var indent = 0
	var from = 0
	var to = 0


class Cursor:
	const OPEN_TEXT = ["(", "[", "{"]
	const CLOSE_TEXT = [")", "]", "}"]

	var toks = []
	var lines = []
	var line_of = []
	var stack = [0]
	var bracket_depth = 0
	var i = 0

	func boot(list):
		toks = list
		lines = group_lines()
		line_of = []
		for k in toks.size():
			line_of.append(0)
		for li in lines.size():
			var l = lines[li]
			for k in range(l.from, l.to):
				line_of[k] = li
		for k in toks.size():
			if toks[k]["kind"] == "eof":
				line_of[k] = lines.size() - 1

	func group_lines():
		var out = []
		for k in toks.size():
			var tk = toks[k]
			if tk["kind"] == "eof":
				continue
			if tk["lineStart"] or out.is_empty():
				var span = LineSpan.new()
				span.row = tk["row"]
				span.indent = tk["indent"]
				span.from = k
				span.to = k + 1
				out.append(span)
			else:
				out[out.size() - 1].to = k + 1
		return out

	func at(off := 0):
		return toks[min(i + off, toks.size() - 1)]
	func take():
		var t = at()
		if OPEN_TEXT.has(t["text"]):
			bracket_depth += 1
		elif CLOSE_TEXT.has(t["text"]) and bracket_depth > 0:
			bracket_depth -= 1
		if i < toks.size() - 1:
			i += 1
		return t

	func at_text(text, off := 0):
		var t = at(off)
		return t["kind"] == "punct" and t["text"] == text

	func at_kind(kind, off := 0):
		return at(off)["kind"] == kind

	func at_eof():
		return at()["kind"] == "eof"

	func line_index(off := 0):
		return line_of[min(i + off, toks.size() - 1)]

	func at_line_head():
		var t = at()
		return t["kind"] != "eof" and bracket_depth == 0 and t["lineStart"]

	func at_statement_end():
		var t = at()
		if t["kind"] == "eof":
			return true
		if t["kind"] == "punct" and (CLOSE_TEXT.has(t["text"]) or t["text"] == ","):
			return true
		return next_is_new_line()

	func next_is_new_line():
		if bracket_depth > 0:
			return false
		var n = at(1)
		if n["kind"] == "eof":
			return not at_eof()
		return n["lineStart"]

	func line_indent(li):
		if li < 0 or li >= lines.size():
			return 0
		var line = lines[li]
		var first = toks[line.from]
		if first["kind"] != "comment" or first["indent"] != 0 or stack.size() <= 1 or stack[1] <= 0:
			return first["indent"]
		if li + 1 >= lines.size():
			return first["indent"]
		var nxt = toks[lines[li + 1].from]["indent"]
		if nxt > 0:
			return stack[1]
		return first["indent"]

	func dedented():
		if at_eof():
			return stack.size() > 1
		return line_indent(line_index()) < stack[stack.size() - 1]

	func deeper_than_block():
		return line_indent(line_index()) > stack[stack.size() - 1]

	func open_block():
		var here = line_index()
		var header = line_of[max(i - 1, 0)]
		if here == header:
			return false
		var want = line_indent(here)
		if want <= stack[stack.size() - 1]:
			return false
		stack.append(want)
		return true

	func close_block():
		if stack.size() > 1:
			stack.pop_back()

	func step_line():
		var nxt = line_index() + 1
		if nxt < lines.size():
			i = lines[nxt].from
		else:
			i = toks.size() - 1

	func colon_opens_block():
		if at(1)["kind"] == "eof":
			return false
		var nxt = line_index(1)
		if nxt == line_index():
			return false
		return line_indent(nxt) > stack[stack.size() - 1]

	func at_body_end():
		var t = at()
		return t["kind"] == "punct" and (CLOSE_TEXT.has(t["text"]) or t["text"] == ",")

	func follows_on_same_line(off := 0):
		var n = at(off + 1)
		if n["kind"] == "eof":
			return false
		return bracket_depth > 0 or not n["lineStart"]

	func skip_extras():
		var out = []
		while i < toks.size() - 1:
			var t = toks[i]
			if t["kind"] != "comment" and t["kind"] != "cont":
				return out
			out.append(t)
			i += 1
		return out

	func skip_extras_on_row(row):
		var out = []
		while i < toks.size() - 1:
			var t = toks[i]
			if (t["kind"] != "comment" and t["kind"] != "cont") or t["row"] != row:
				return out
			out.append(t)
			i += 1
		return out


static func yes_no(v):
	return "T" if v else "-"


static func walk(text, mode):
	var c = Cursor.new()
	c.boot(L.lex(text)["tokens"])
	var rows = []
	for step in 14:
		if c.i >= c.toks.size():
			break
		var t = c.at()
		rows.append("q|%d|%s|%d|%d|%d|%d|%s|%s|%s|%s|%s|%s|%s|%s|%s" % [c.i, t["kind"], c.line_index(), c.line_indent(c.line_index()), c.stack.size(), c.bracket_depth, yes_no(c.at_eof()), yes_no(c.at_line_head()), yes_no(c.at_statement_end()), yes_no(c.next_is_new_line()), yes_no(c.dedented()), yes_no(c.deeper_than_block()), yes_no(c.at_body_end()), yes_no(c.follows_on_same_line(0)), yes_no(c.colon_opens_block())])
		if mode == 0:
			c.take()
		elif mode == 1:
			if c.open_block():
				c.take()
			elif c.dedented():
				c.close_block()
			else:
				c.take()
		elif mode == 2:
			c.skip_extras()
		else:
			c.step_line()
	return rows


static func group_lines(toks):
	var out = []
	for k in toks.size():
		var tk = toks[k]
		if tk["kind"] == "eof":
			continue
		if tk["lineStart"] or out.is_empty():
			var span = LineSpan.new()
			span.row = tk["row"]
			span.indent = tk["indent"]
			span.from = k
			span.to = k + 1
			out.append(span)
		else:
			out[out.size() - 1].to = k + 1
	return out
