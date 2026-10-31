const E = preload("res://expr.gd")
const DC = preload("res://decl.gd")
const D = preload("res://diag.gd")

const AUG_OPS = ["+=", "-=", "*=", "/=", "**=", "%=", ">>=", "<<=", "&=", "^=", "|="]
const DECL_WORDS = ["var", "const", "signal", "class_name", "class", "func", "static"]


static func after(t):
	return {"index": t["end"], "row": t["row"], "col": t["col"] + (t["end"] - t["start"])}


static func parse_body(p, field, colon, node_type := "body"):
	var b = p.b
	var tail = p.flush_extras_on_row(colon["row"])
	var start = after(colon) if tail == null else after(tail)
	if not p.c.open_block():
		var same = not p.at_eof() and not p.at_body_end() and p.peek()["row"] == colon["row"]
		b.open(node_type, null if same else after(colon))
		if same:
			p.flush()
			parse_statement_line(p, node_type == "class_body")
		b.close(field)
		return false
	b.open(node_type, start)
	while true:
		if p.at_eof() or p.at_body_end() or p.dedented():
			break
		p.flush()
		if p.at_eof() or p.at_body_end() or p.dedented():
			break
		parse_statement_line(p, node_type == "class_body")
		if p.failed:
			return true
		p.flush()
	b.close(field)
	p.c.close_block()
	return true


static func parse_statement_line(p, members):
	parse_statement(p, "", members)
	while p.at_punct(";") and not p.at_line_head():
		p.b.anon(p.take(), "")
		if p.at_eof() or p.at_line_head():
			return
		parse_statement(p, "", members)
		if p.failed:
			return


static func parse_statement(p, field, members := false):
	if p.failed:
		return
	var b = p.b
	var t = p.peek()
	if t["kind"] == "region-start":
		b.open("region_start")
		b.anon(p.take(), "")
		if p.at_kind("region-label"):
			b.leaf("region_label", p.take(), "")
		b.close(field)
		return
	if t["kind"] == "region-end":
		b.leaf("region_end", p.take(), field)
		return
	if t["kind"] == "punct" and t["text"] == "@":
		var anns = DC.parse_annotation_run(p)
		if p.failed:
			return
		var n = p.peek()
		if not p.at_line_head() and n["kind"] == "ident" and DECL_WORDS.has(n["text"]):
			parse_decl(p, field, anns, members)
			return
		for a in anns:
			b.attach(a, "")
		return
	if t["kind"] == "ident":
		if t["text"] == "if":
			parse_if(p, field)
			return
		if t["text"] == "for":
			parse_for(p, field)
			return
		if t["text"] == "while":
			parse_while(p, field)
			return
		if t["text"] == "match":
			parse_match(p, field)
			return
		if t["text"] == "enum":
			DC.parse_enum_definition(p, field)
			return
		if t["text"] == "return":
			b.open("return_statement")
			b.anon(p.take(), "")
			if p.at_operand():
				E.parse_rhs(p, "")
			b.close(field)
			return
		if t["text"] == "pass" or t["text"] == "break" or t["text"] == "continue":
			b.open(t["text"] + "_statement")
			b.anon(p.take(), "")
			b.close(field)
			return
		if t["text"] == "breakpoint":
			b.leaf("breakpoint_statement", p.take(), field)
			return
		parse_decl(p, field, [], members)
		return
	parse_expression_statement(p, field)


static func parse_decl(p, field, anns, members):
	var t = p.peek()
	if t["kind"] != "ident":
		parse_expression_statement(p, field)
		return
	var w = t["text"]
	if w == "func":
		DC.parse_function(p, field, anns, null, members)
		return
	if w == "static":
		if p.at_word("func", 1):
			var kw = p.take()
			DC.parse_function(p, field, anns, kw, members)
			return
		DC.parse_variable(p, field, anns, members)
		return
	if w == "class":
		DC.parse_class_definition(p, field, anns)
		return
	if w == "class_name":
		DC.parse_class_name(p, field, anns)
		return
	if w == "extends":
		DC.parse_extends(p, field, anns)
		return
	if w == "signal":
		DC.parse_signal(p, field, anns)
		return
	if w == "const":
		DC.parse_const(p, field, anns)
		return
	if w == "var" or w == "onready" or w == "export":
		DC.parse_variable(p, field, anns, members)
		return
	if members:
		p.fail(["类成员"], "class-node")
		return
	parse_expression_statement(p, field)


static func parse_expression_statement(p, field):
	var b = p.b
	var m = b.mark()
	E.parse_expression(p, "")
	if p.failed:
		return
	if not p.at_line_head():
		if p.at_punct("="):
			var left = b.splice_from(m)
			b.open("assignment")
			b.attach(left, "left")
			b.anon(p.take(), "")
			E.parse_rhs(p, "right")
			b.close("")
			wrap_statement(p, field)
			return
		for op in AUG_OPS:
			if p.at_punct(op):
				var left2 = b.splice_from(m)
				b.open("augmented_assignment")
				b.attach(left2, "left")
				b.anon(p.take(), "op")
				E.parse_rhs(p, "right")
				b.close("")
				wrap_statement(p, field)
				return
	b.set_last_field("")
	wrap_statement(p, field)


static func wrap_statement(p, field):
	var b = p.b
	var inner = b.lift_last()
	b.open("expression_statement")
	b.attach(inner, "")
	b.close(field)


static func parse_if(p, field):
	var b = p.b
	var level = p.block_indent()
	b.open("if_statement")
	b.anon(p.expect_word("if", "if"), "")
	E.parse_expression(p, "condition")
	if p.failed:
		return
	var colon = p.expect_punct(":", "if")
	b.anon(colon, "")
	var block = parse_body(p, "body", colon)
	if p.failed:
		return
	if block:
		while true:
			if p.at_word("elif") and p.at_line_head() and p.block_indent() == level:
				b.open("elif_clause")
				b.anon(p.take(), "")
				E.parse_expression(p, "condition")
				if p.failed:
					return
				var c2 = p.expect_punct(":", "elif")
				b.anon(c2, "")
				parse_body(p, "body", c2)
				if p.failed:
					return
				b.close("alternative")
				continue
			if p.at_word("else") and p.at_line_head() and p.block_indent() == level:
				b.open("else_clause")
				b.anon(p.take(), "")
				var c3 = p.expect_punct(":", "else")
				b.anon(c3, "")
				parse_body(p, "body", c3)
				if p.failed:
					return
				b.close("alternative")
			break
	b.close(field)


static func parse_for(p, field):
	var b = p.b
	b.open("for_statement")
	b.anon(p.expect_word("for", "for"), "")
	if not p.at_kind("ident"):
		p.fail(["循环变量"], "for")
		return
	b.leaf("identifier", p.take(), "left")
	if p.at_punct(":"):
		b.anon(p.take(), "")
		E.parse_type(p, "type")
		if p.failed:
			return
	b.anon(p.expect_word("in", "for"), "")
	E.parse_expression(p, "right")
	if p.failed:
		return
	var colon = p.expect_punct(":", "for")
	b.anon(colon, "")
	parse_body(p, "body", colon)
	b.close(field)


static func parse_while(p, field):
	var b = p.b
	b.open("while_statement")
	b.anon(p.expect_word("while", "while"), "")
	E.parse_expression(p, "condition")
	if p.failed:
		return
	var colon = p.expect_punct(":", "while")
	b.anon(colon, "")
	parse_body(p, "body", colon)
	b.close(field)


static func parse_match(p, field):
	var b = p.b
	b.open("match_statement")
	var kw = p.expect_word("match", "match")
	b.anon(kw, "")
	E.parse_expression(p, "value")
	if p.failed:
		p.decorate_last(D.sentence("matchSubjectExpr"), kw["row"])
		return
	var colon = p.expect_punct(":", "match")
	if p.failed:
		p.decorate_last(D.sentence("matchSubjectColon"), kw["row"])
		return
	b.anon(colon, "")
	b.open("match_body", after(colon))
	if not p.c.open_block():
		p.fail(["缩进的手臂"], "match", D.sentence("matchEmptyBlock"), kw["row"])
		return
	while true:
		if p.at_eof() or p.at_body_end() or p.dedented():
			break
		p.flush()
		if p.at_eof() or p.at_body_end() or p.dedented():
			break
		while p.at_punct("@"):
			DC.parse_annotation(p, "")
			if p.failed:
				return
		parse_pattern_section(p)
		if p.failed:
			return
		p.flush()
	b.close("body")
	p.c.close_block()
	b.close(field)


static func parse_pattern_section(p):
	var b = p.b
	var arm_row = p.peek()["row"]
	b.open("pattern_section")
	while true:
		if p.at_word("var"):
			b.open("pattern_binding")
			b.anon(p.take(), "")
			if not p.at_kind("ident"):
				p.fail(["绑定名"], "pattern", D.sentence("matchPatternExpr"))
				return
			b.leaf("identifier", p.take(), "")
			b.close("")
		else:
			E.parse_expression(p, "")
			if p.failed:
				p.decorate_last(D.sentence("matchPatternExpr"), arm_row)
				return
		if not p.at_punct(","):
			break
		b.anon(p.take(), "")
		if not pattern_expr_ahead(p):
			p.fail(["表达式"], "pattern", D.sentence("matchPatternExpr"))
			return
	var guarded = false
	if p.at_word("when"):
		guarded = true
		b.open("pattern_guard")
		b.anon(p.take(), "")
		if not pattern_expr_ahead(p):
			p.fail(["表达式"], "pattern", D.sentence("matchGuardExpr"))
			return
		E.parse_expression(p, "")
		if p.failed:
			p.decorate_last(D.sentence("matchGuardExpr"), arm_row)
			return
		b.close("")
	var want = D.sentence("matchGuardColon") if guarded else D.sentence("matchPatternsColon")
	if not p.at_punct(":"):
		p.fail([":"], "match", want)
		return
	var colon = p.take()
	b.anon(colon, "")
	parse_body(p, "body", colon)
	if p.failed:
		p.decorate_last("", arm_row)
		return
	b.close("")


static func pattern_expr_ahead(p):
	if p.at_eof():
		return false
	if p.at_line_head() and p.deeper_than_block():
		return false
	if p.at_punct(":") or p.at_punct(",") or p.at_punct(")") or p.at_punct("]") or p.at_punct("}"):
		return false
	return true


static func parse_lambda(p, field):
	var b = p.b
	b.open("lambda")
	b.anon(p.expect_word("func", "lambda"), "")
	if p.at_kind("ident") and p.at_punct("(", 1):
		b.leaf("name", p.take(), "name")
	parse_parameters_of(p)
	if p.failed:
		return
	if p.at_punct("->"):
		b.anon(p.take(), "")
		E.parse_type(p, "return_type")
	var colon = p.expect_punct(":", "lambda")
	b.anon(colon, "")
	parse_body(p, "body", colon)
	b.close(field)


static func parse_parameters_of(p):
	var b = p.b
	b.open("parameters")
	b.anon(p.expect_punct("(", "parameters"), "")
	if not p.at_punct(")"):
		while true:
			b.flush()
			parse_parameter(p)
			if p.failed:
				return
			if not p.at_punct(","):
				break
			b.anon(p.take(), "")
			if p.at_punct(")"):
				break
	b.flush()
	b.anon(p.expect_punct(")", "parameters"), "")
	b.close("parameters")


static func parse_parameter(p):
	var b = p.b
	if p.at_punct("..."):
		b.open("variadic_parameter")
		b.anon(p.take(), "")
		parse_parameter(p)
		b.close("")
		return
	if not p.at_kind("ident"):
		p.fail(["形参名"], "parameters")
		return
	var name = p.take()
	if p.at_punct(":=") or (p.at_punct(":") and p.at_punct("=", 1)):
		b.open("typed_default_parameter")
		b.leaf("identifier", name, "")
		b.open("inferred_type")
		if p.at_punct(":="):
			b.anon(p.take(), "")
		else:
			b.anon(p.take(), "")
			b.anon(p.expect_punct("=", "parameters"), "")
		b.close("type")
		E.parse_rhs(p, "value")
		b.close("")
		return
	if p.at_punct(":"):
		var defaulted = param_has_default(p)
		b.open("typed_default_parameter" if defaulted else "typed_parameter")
		b.leaf("identifier", name, "")
		b.anon(p.take(), "")
		E.parse_type(p, "type")
		if p.failed:
			return
		if defaulted:
			b.anon(p.expect_punct("=", "parameters"), "")
			E.parse_rhs(p, "value")
		b.close("")
		return
	if p.at_punct("="):
		b.open("default_parameter")
		b.leaf("identifier", name, "")
		b.anon(p.take(), "")
		E.parse_rhs(p, "value")
		b.close("")
		return
	b.leaf("identifier", name, "")


static func param_has_default(p):
	var depth = 0
	for k in range(1, 64):
		var t = p.peek(k)
		if t["kind"] == "eof":
			return false
		if t["kind"] != "punct":
			continue
		if t["text"] == "(" or t["text"] == "[" or t["text"] == "{":
			depth += 1
			continue
		if t["text"] == ")" or t["text"] == "]" or t["text"] == "}":
			if depth == 0:
				return false
			depth -= 1
			continue
		if depth > 0:
			continue
		if t["text"] == ",":
			return false
		if t["text"] == "=":
			return true
	return false
