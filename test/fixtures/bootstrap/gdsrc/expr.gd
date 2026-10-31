const S = preload("res://state.gd")
const B = preload("res://builder.gd")
const D = preload("res://diag.gd")

const BP = {"or": 3, "and": 4, "in": 5, "compare": 6, "bitOr": 7, "bitAnd": 8, "xor": 9, "shift": 10, "plus": 11, "times": 12, "power": 13, "unary": 14, "is": 15, "as": 16}
const INFIX = {
	"||": 3,
	"or": 3,
	"&&": 4,
	"and": 4,
	"in": 5,
	"<": 6,
	"<=": 6,
	"==": 6,
	"!=": 6,
	">=": 6,
	">": 6,
	"|": 7,
	"&": 8,
	"^": 9,
	"<<": 10,
	">>": 10,
	"+": 11,
	"-": 11,
	"*": 12,
	"/": 12,
	"%": 12,
	"**": 13,
	"is": 15,
	"as": 16,
}
const PREFIX = ["-", "+", "~", "!"]


static func infix_at(p):
	var t = p.peek()
	if t["kind"] != "punct" and t["kind"] != "ident":
		return null
	var next = p.peek(1)
	if t["text"] == "not" and next["text"] == "in" and next["kind"] == "ident":
		return {"bp": 5, "toks": [t, next]}
	if t["text"] == "is" and next["text"] == "not" and next["kind"] == "ident":
		return {"bp": 15, "toks": [t, next]}
	if INFIX.has(t["text"]):
		return {"bp": INFIX[t["text"]], "toks": [t]}
	return null


static func parse_expression(p, field):
	if p.failed:
		return
	var b = p.b
	parse_binary(p, 0)
	if p.failed:
		return
	if not p.at_word("if") or p.at_line_head():
		b.set_last_field(field)
		return
	var left = b.lift_last()
	b.open("conditional_expression")
	b.attach(left, "left")
	b.anon(p.take(), "")
	parse_expression(p, "condition")
	if p.failed:
		return
	b.anon(p.expect_word("else", "ternary"), "")
	parse_expression(p, "right")
	b.close(field)


static func parse_binary(p, min_bp):
	if p.failed:
		return
	var b = p.b
	parse_unary(p)
	while not p.failed:
		if p.at_line_head():
			return
		var inf: Variant = infix_at(p)
		if inf == null or inf["bp"] < min_bp:
			return
		var left = b.lift_last()
		b.open("binary_operator")
		b.attach(left, "left")
		for t in inf["toks"]:
			p.take()
			b.anon(t, "op")
		parse_binary(p, inf["bp"] + 1)
		b.set_last_field("right")
		b.close("")


static func parse_unary(p):
	if p.failed:
		return
	var b = p.b
	var t = p.peek()
	var is_not = t["kind"] == "ident" and t["text"] == "not"
	var is_prefix = (t["kind"] == "punct" and PREFIX.has(t["text"])) or is_not
	if not is_prefix:
		parse_postfix(p)
		return
	b.open("unary_operator")
	b.anon(p.take(), "")
	parse_binary(p, 5 if is_not else 14)
	b.close("")


static func parse_postfix(p):
	if p.failed:
		return
	var b = p.b
	parse_atom(p)
	while not p.failed:
		if p.at_line_head():
			return
		if p.at_punct("."):
			var base = b.lift_last()
			b.open("attribute")
			b.attach(base, "")
			while true:
				b.anon(p.take(), "")
				parse_attribute_member(p)
				if p.failed:
					return
				if not (p.at_punct(".") and not p.at_line_head()):
					break
			b.close("")
			continue
		if p.at_punct("("):
			var callee = b.lift_last()
			b.open("call")
			b.attach(callee, "")
			parse_arguments(p, "arguments")
			b.close("")
			continue
		if p.at_punct("["):
			var target = b.lift_last()
			b.open("subscript")
			b.attach(target, "")
			parse_subscript_arguments(p, "arguments")
			b.close("")
			continue
		return


static func parse_attribute_member(p):
	if p.failed:
		return
	var b = p.b
	var t = p.peek()
	if t["kind"] != "ident":
		p.fail(["成员名"], "attribute")
		return
	if p.at_punct("(", 1):
		b.open("attribute_call")
		b.leaf("identifier", p.take(), "")
		parse_arguments(p, "arguments")
		b.close("")
		return
	if p.at_punct("[", 1):
		b.open("attribute_subscript")
		b.leaf("identifier", p.take(), "")
		parse_subscript_arguments(p, "arguments")
		b.close("")
		return
	b.leaf("identifier", p.take(), "")


static func parse_arguments(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("arguments")
	b.anon(p.expect_punct("(", "arguments"), "")
	if not p.at_punct(")"):
		while true:
			b.flush()
			parse_rhs(p, "")
			if p.failed:
				return
			if not p.at_punct(","):
				break
			b.anon(p.take(), "")
			if p.at_punct(")"):
				break
	b.flush()
	b.anon(p.expect_punct(")", "arguments"), "")
	b.close(field)


static func parse_subscript_arguments(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("subscript_arguments")
	b.anon(p.expect_punct("[", "subscript"), "")
	while true:
		b.flush()
		parse_rhs(p, "")
		if p.failed:
			return
		if not p.at_punct(","):
			break
		b.anon(p.take(), "")
	b.flush()
	b.anon(p.expect_punct("]", "subscript"), "")
	b.close(field)


static func stmt_mod():
	return load("res://stmt.gd")


static func parse_rhs(p, field):
	if p.failed:
		return
	if p.at_word("func"):
		stmt_mod().parse_lambda(p, field)
		return
	parse_expression(p, field)


static func parse_atom(p):
	if p.failed:
		return
	var b = p.b
	var t = p.peek()
	if t["kind"] == "int":
		b.leaf("integer", p.take(), "")
		return
	if t["kind"] == "float":
		b.leaf("float", p.take(), "")
		return
	if t["kind"] == "str-start":
		parse_string(p, "")
		return
	if t["kind"] == "ident":
		if t["text"] == "true" or t["text"] == "false" or t["text"] == "null":
			b.leaf(t["text"], p.take(), "")
			return
		if t["text"] == "await":
			b.open("await_expression")
			b.anon(p.take(), "")
			parse_expression(p, "")
			b.close("")
			return
		if t["text"] == "func":
			stmt_mod().parse_lambda(p, "")
			return
		b.leaf("identifier", p.take(), "")
		return
	if t["kind"] == "punct":
		if t["text"] == "(":
			b.open("parenthesized_expression")
			b.anon(p.take(), "")
			b.flush()
			parse_rhs(p, "")
			if p.failed:
				return
			b.flush()
			b.anon(p.expect_punct(")", "paren", D.sentence("parenClose")), "")
			b.close("")
			return
		if t["text"] == "[":
			parse_array(p, "")
			return
		if t["text"] == "{":
			parse_dictionary(p, "")
			return
		if t["text"] == ".":
			b.open("base_call")
			b.anon(p.take(), "")
			b.leaf("identifier", p.take(), "")
			parse_arguments(p, "arguments")
			b.close("")
			return
		if t["text"] == "$" or t["text"] == "%":
			parse_get_node(p, "")
			return
	p.fail(["表达式"], "expr")


static func parse_string(p, field):
	if p.failed:
		return
	var b = p.b
	var start = p.take()
	var head = "\""
	var type = "string"
	if start["text"].begins_with("&"):
		head = "&\""
		type = "string_name"
	elif start["text"].begins_with("^") or start["text"].begins_with("@"):
		head = "^\""
		type = "node_path"
	b.open(type)
	b.anon_as(head, start, "")
	while p.at_kind("escape"):
		b.leaf("escape_sequence", p.take(), "")
	b.anon_as("\"", p.expect_kind("str-end", "string"), "")
	b.close(field)


static func parse_get_node(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("get_node")
	var last = p.take()
	b.anon(last, "")
	if p.at_kind("str-start"):
		parse_string(p, "")
		var n = b.lift_last()
		n["type"] = "value"
		n["isNamed"] = false
		b.attach(n, "")
		b.close(field)
		return
	if p.at_punct("/"):
		last = p.take()
		b.anon(last, "")
	if not p.at_kind("ident"):
		p.fail(["节点名"], "get_node")
		return
	last = p.take()
	while p.at_punct("/"):
		last = p.take()
		b.anon(last, "")
		if not p.at_kind("ident"):
			p.fail(["节点名"], "get_node")
			return
		last = p.take()
	b.set_end(last)
	b.close(field)


static func parse_array(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("array")
	b.anon(p.expect_punct("[", "array"), "")
	if not p.at_punct("]"):
		while true:
			b.flush()
			if p.at_word("var"):
				parse_pattern_binding(p, "")
			else:
				parse_rhs(p, "")
			if p.failed:
				return
			if not p.at_punct(","):
				break
			b.anon(p.take(), "")
			if p.at_punct("]"):
				break
	b.flush()
	if p.at_punct(".."):
		b.leaf("pattern_open_ending", p.take(), "")
	b.anon(p.expect_punct("]", "array"), "")
	b.close(field)


static func parse_dictionary(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("dictionary")
	b.anon(p.expect_punct("{", "dictionary"), "")
	if not p.at_punct("}"):
		while true:
			b.flush()
			parse_dict_entry(p)
			if p.failed:
				return
			if not p.at_punct(","):
				break
			b.anon(p.take(), "")
			if p.at_punct("}"):
				break
	b.flush()
	if p.at_punct(".."):
		b.leaf("pattern_open_ending", p.take(), "")
	b.anon(p.expect_punct("}", "dictionary"), "")
	b.close(field)


static func parse_dict_entry(p):
	if p.failed:
		return
	var b = p.b
	var m = b.mark()
	if p.at_word("var"):
		parse_pattern_binding(p, "")
		return
	parse_rhs(p, "")
	if p.failed:
		return
	if p.at_punct(":"):
		var left = b.splice_from(m)
		b.open("pair")
		b.attach(left, "left")
		b.anon(p.take(), "")
		parse_dict_value(p)
		b.close("")
		return
	if p.at_punct("="):
		var left2 = b.splice_from(m)
		b.open("pair")
		b.attach(left2, "left")
		b.anon(p.take(), "")
		parse_dict_value(p)
		b.close("")
		return
	b.set_last_field("")


static func parse_dict_value(p):
	if p.failed:
		return
	if p.at_word("var"):
		parse_pattern_binding(p, "value")
	else:
		parse_rhs(p, "value")


static func parse_pattern_binding(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("pattern_binding")
	b.anon(p.expect_word("var", "pattern"), "")
	if not p.at_kind("ident"):
		p.fail(["绑定名"], "pattern")
		return
	b.leaf("identifier", p.take(), "")
	b.close(field)


static func parse_type(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("type")
	parse_postfix(p)
	b.close(field)


static func parse_inferred_type(p, field):
	if p.failed:
		return
	var b = p.b
	b.open("inferred_type")
	if p.at_punct(":="):
		b.anon(p.take(), "")
	else:
		b.anon(p.expect_punct(":", "inferred_type"), "")
		b.anon(p.expect_punct("=", "inferred_type"), "")
	b.close(field)


static func dump_expr(text):
	var p = S.Parser.new()
	p.boot(text)
	parse_expression(p, "")
	var root = p.b.root(text.length())
	var rows = B.dump(root, 0, [])
	for e in p.issues:
		rows.append("err|" + e["context"] + "|" + str(e["got"]))
	return rows
