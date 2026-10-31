const I = preload("res://indent.gd")
const B = preload("res://builder.gd")
const L = preload("res://lexer.gd")
const D = preload("res://diag.gd")


class Parser:
	var c = null
	var b = null
	var issues = []
	var failed = false
	var got = ""

	func boot(text):
		var lexed = L.lex(text)
		c = I.Cursor.new()
		c.boot(lexed["tokens"])
		b = B.Builder.new()
		b.boot(text)
		issues = []
		for e in lexed["issues"]:
			issues.append(e)

	func stash():
		while true:
			var t = c.at()
			if t["kind"] != "comment" and t["kind"] != "cont":
				return
			if c.dedented():
				return
			for x in c.skip_extras_on_row(t["row"]):
				if x["kind"] == "comment":
					b.stash_comment(x)
				else:
					b.stash_continuation(x)

	func peek(off := 0):
		stash()
		return c.at(off)

	func take():
		stash()
		return c.take()

	func at_punct(text, off := 0):
		stash()
		return c.at_text(text, off)

	func at_kind(kind, off := 0):
		stash()
		return c.at_kind(kind, off)

	func at_word(text, off := 0):
		stash()
		var t = c.at(off)
		return t["kind"] == "ident" and t["text"] == text

	func at_eof():
		stash()
		return c.at_eof()

	func at_line_head():
		stash()
		return c.at_line_head()

	func statement_end():
		stash()
		return c.at_statement_end()

	func dedented():
		return c.dedented()

	func deeper_than_block():
		stash()
		return c.deeper_than_block()

	func at_body_end():
		stash()
		return c.at_body_end()

	func same_line(off := 0):
		stash()
		return c.follows_on_same_line(off)

	func colon_opens_block():
		stash()
		return c.colon_opens_block()

	func flush_extras_on_row(row):
		var skipped = c.skip_extras_on_row(row)
		for t in skipped:
			if t["kind"] == "comment":
				b.stash_comment(t)
			else:
				b.stash_continuation(t)
		b.flush()
		if skipped.is_empty():
			return null
		return skipped[skipped.size() - 1]

	func block_indent():
		return c.line_indent(c.line_index())

	func at_operand():
		stash()
		if c.at_eof():
			return false
		if c.at_line_head():
			return false
		var t = c.at()
		if t["kind"] == "punct" and (t["text"] == "," or t["text"] == ")" or t["text"] == "]" or t["text"] == "}"):
			return false
		return true

	func decorate_last(sentence := "", report_row := -1, code := "", force_sentence := false):
		if issues.is_empty():
			return
		var it = issues[issues.size() - 1]
		if sentence != "" and (force_sentence or it["sentence"] == ""):
			it["sentence"] = sentence
		if report_row >= 0:
			it["reportRow"] = report_row
		if code != "":
			it["code"] = code
		it["message"] = D.render(it)

	func flush():
		b.flush()

	func open_block():
		stash()
		return c.open_block()

	func close_block():
		c.close_block()

	func fail(expected, context, sentence := "", report_row := -1, code := "line-continuation"):
		var t = peek()
		var text = "<eof>" if t["kind"] == "eof" else t["text"]
		var row = t["row"] if report_row < 0 else report_row
		var it = D.issue(t["start"], t["row"], t["col"], text, expected, context, sentence, row, code)
		it["message"] = D.render(it)
		issues.append(it)
		failed = true
		got = "" if t["kind"] == "eof" else t["text"]

	func expect_punct(text, context, sentence := "", report_row := -1, code := "line-continuation"):
		if at_punct(text):
			var t = take()
			return t
		fail(["\"" + text + "\""], context, sentence, report_row, code)
		return null

	func expect_word(text, context):
		if at_word(text):
			return take()
		fail(["\"" + text + "\""], context)
		return null

	func expect_kind(kind, context, sentence := "", report_row := -1, code := "line-continuation"):
		if at_kind(kind):
			return take()
		fail([kind], context, sentence, report_row, code)
		return null


static func parse_group(p):
	if p.at_punct("("):
		p.b.open("parenthesized_expression")
		p.b.anon(p.take(), "")
		while not p.at_eof() and not p.at_punct(")"):
			if not parse_item(p):
				return false
			if p.at_punct(","):
				p.b.anon(p.take(), "")
				continue
			break
		var closing = p.expect_punct(")", "parenthesized_expression")
		if closing != null:
			p.b.anon(closing, "")
		p.b.close("body")
		return not p.failed
	return parse_item(p)


static func parse_item(p):
	if p.at_kind("ident"):
		p.b.leaf("identifier", p.take(), "")
		return true
	if p.at_kind("int") or p.at_kind("float"):
		var t = p.take()
		p.b.leaf(t["kind"], t, "")
		return true
	if p.at_kind("punct") and p.at_punct("-"):
		p.b.open("neg")
		p.b.anon(p.take(), "")
		if not parse_item(p):
			return false
		p.b.close("value")
		return true
	var bad = p.peek()
	p.fail(["identifier", "number", "("], "item")
	p.got = bad["text"]
	return false


static func parse_tree(text, stop_after):
	var p = Parser.new()
	p.boot(text)
	var guard = 0
	while not p.at_eof() and guard < stop_after:
		guard += 1
		if not parse_group(p):
			break
	return p.b.root(text.length())


static func run(text, stop_after):
	var p = Parser.new()
	p.boot(text)
	var rows = []
	var guard = 0
	while not p.at_eof() and guard < stop_after:
		guard += 1
		var before = p.c.i
		if not parse_group(p):
			rows.append("stop|" + p.got + "|" + p.issues[p.issues.size() - 1]["context"])
			break
		if p.c.i == before:
			p.take()
		if p.failed:
			rows.append("failed|" + p.got)
			break
	var tree = p.b.root(text.length())
	rows.append("root|%d|%d|%d" % [tree["children"].size(), tree["namedChildren"].size(), tree["endIndex"]])
	for c in tree["children"]:
		rows.append("id|%d|%d|%d" % [c["id"], p.b.parent_id(c), tree["id"]])
		for g in c["children"]:
			rows.append("id|%d|%d|%d" % [g["id"], p.b.parent_id(g), c["id"]])
	for i in p.issues.size():
		var e = p.issues[i]
		rows.append("err|%d|%d|%d|%s|%s|%s" % [e["at"], e["row"], e["column"], e["got"], e["expected"][0], e["context"]])
		rows.append("msg|" + e["message"])
	return B.dump(tree, 0, []) + rows
