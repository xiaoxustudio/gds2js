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

	func flush():
		b.flush()

	func open_block():
		stash()
		return c.open_block()

	func close_block():
		c.close_block()

	func fail(expected, context):
		var t = peek()
		var text = "<eof>" if t["kind"] == "eof" else t["text"]
		var it = D.issue(t["start"], t["row"], t["col"], text, expected, context, "", t["row"], "line-continuation")
		it["message"] = D.render(it)
		issues.append(it)
		failed = true
		got = "" if t["kind"] == "eof" else t["text"]

	func expect_punct(text, context):
		if at_punct(text):
			var t = take()
			return t
		fail(["\"" + text + "\""], context)
		return null

	func expect_word(text, context):
		if at_word(text):
			return take()
		fail(["\"" + text + "\""], context)
		return null

	func expect_kind(kind, context):
		if at_kind(kind):
			return take()
		fail([kind], context)
		return null


static func parse_group(p):
	if p.at_punct("("):
		p.b.open("group")
		p.b.anon(p.take(), "")
		while not p.at_eof() and not p.at_punct(")"):
			if not parse_item(p):
				return false
			if p.at_punct(","):
				p.b.anon(p.take(), "")
				continue
			break
		var closing = p.expect_punct(")", "group")
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
	for i in p.issues.size():
		var e = p.issues[i]
		rows.append("err|%d|%d|%d|%s|%s|%s" % [e["at"], e["row"], e["column"], e["got"], e["expected"][0], e["context"]])
		rows.append("msg|" + e["message"])
	return B.dump(tree, 0, []) + rows
