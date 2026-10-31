const E = preload("res://expr.gd")
const D = preload("res://diag.gd")

const ACC = "property-setget"
const REMOTE = ["remote", "master", "puppet", "remotesync", "mastersync", "puppetsync"]


static func stmt_mod():
	return load("res://stmt.gd")


static func is_remote(name):
	return REMOTE.has(name)


static func emit_annotations(p, anns):
	if anns.size() == 0:
		return
	p.b.open("annotations")
	for a in anns:
		p.b.attach(a, "")
	p.b.close("")


static func parse_annotation(p, field):
	var b = p.b
	b.open("annotation")
	b.anon(p.expect_punct("@", "annotation"), "")
	if not p.at_kind("ident"):
		p.fail(["注解名"], "annotation")
		return
	b.leaf("identifier", p.take(), "")
	if p.at_punct("("):
		parse_arguments_of(p, "arguments")
	b.close(field)


static func parse_annotation_run(p):
	var m = p.b.mark()
	while true:
		parse_annotation(p, "")
		if p.failed:
			return []
		if not (p.at_punct("@") and not p.at_line_head()):
			break
	return p.b.splice_all(m)


static func parse_arguments_of(p, field):
	var b = p.b
	b.open("arguments")
	b.anon(p.expect_punct("(", "arguments"), "")
	if not p.at_punct(")"):
		while true:
			b.flush()
			E.parse_rhs(p, "")
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


static func parse_variable(p, field, anns := [], members := false):
	var b = p.b
	b.open("variable_statement")
	emit_annotations(p, anns)
	if p.at_kind("ident") and is_remote(p.peek()["text"]):
		b.leaf("remote_keyword", p.take(), "")
	if p.at_word("static"):
		b.leaf("static_keyword", p.take(), "static")
	if p.at_word("onready"):
		b.anon(p.take(), "")
	if p.at_word("export"):
		b.anon(p.take(), "")
		if p.at_punct("("):
			parse_arguments_of(p, "arguments")
			if p.failed:
				return
		if p.at_word("onready"):
			b.anon(p.take(), "")
		elif p.at_kind("ident") and is_remote(p.peek()["text"]):
			b.leaf("remote_keyword", p.take(), "")
	b.anon(p.expect_word("var", "var"), "")
	if not p.at_kind("ident"):
		p.fail(["变量名"], "var")
		return
	b.leaf("name", p.take(), "name")
	var typed = parse_var_tail(p)
	if p.failed:
		return
	if p.at_punct(":"):
		var colon_row = p.peek()["row"]
		parse_setget(p)
		if p.failed:
			if typed or members:
				return
			p.decorate_last(D.sentence("varTypeAfterColon"), colon_row, "line-continuation", true)
			return
	b.close(field)


static func parse_var_tail(p):
	var b = p.b
	if p.at_punct(":=") or (p.at_punct(":") and p.at_punct("=", 1)):
		parse_inferred_of(p)
		E.parse_rhs(p, "value")
		return false
	if p.at_punct(":") and not p.colon_opens_block():
		b.anon(p.take(), "")
		E.parse_type(p, "type")
		if p.failed:
			return true
		if p.at_punct("=") and not p.at_line_head():
			b.anon(p.take(), "")
			E.parse_rhs(p, "value")
		return true
	if p.at_punct("=") and not p.at_line_head():
		b.anon(p.take(), "")
		E.parse_rhs(p, "value")
	return false


static func parse_inferred_of(p):
	var b = p.b
	b.open("inferred_type")
	if p.at_punct(":="):
		b.anon(p.take(), "")
	else:
		b.anon(p.expect_punct(":", "inferred_type"), "")
		b.anon(p.expect_punct("=", "inferred_type"), "")
	b.close("type")


static func parse_setget(p):
	var b = p.b
	b.open("setget")
	b.anon(p.expect_punct(":", "setget"), "")
	if p.c.open_block():
		while true:
			if p.at_eof() or p.at_body_end() or p.dedented():
				break
			p.flush()
			if p.at_eof() or p.at_body_end() or p.dedented():
				break
			var assigned = false
			if p.at_word("get") and not p.at_punct("=", 1):
				parse_get_body(p)
				assigned = false
			elif p.at_word("set") and not p.at_punct("=", 1):
				parse_set_body(p)
				assigned = false
			elif p.at_word("get") or p.at_word("set"):
				parse_setget_assign(p)
				assigned = true
			else:
				p.fail(["get", "set"], "setget")
				return
			if p.failed:
				return
			p.flush()
			if p.at_eof() or p.dedented():
				break
			if p.at_punct(","):
				b.anon(p.take(), "")
				continue
			if not assigned and (p.at_word("get") or p.at_word("set")):
				continue
			p.fail([","], "setget", D.sentence("accBlockEnd"), -1, ACC)
			return
		p.c.close_block()
		b.close("setget")
		return
	if p.at_word("setget"):
		parse_setget_assign(p)
		b.close("setget")
		return
	parse_setget_assign(p)
	if p.failed:
		return
	if p.at_punct(","):
		b.anon(p.take(), "")
		parse_setget_assign(p)
	b.close("setget")


static func parse_setget_assign(p):
	var b = p.b
	if p.at_word("setget"):
		b.anon(p.take(), "")
		if p.at_punct(","):
			b.anon(p.take(), "")
			b.leaf("getter", p.expect_kind("ident", "setget"), "get")
			return
		b.leaf("setter", p.expect_kind("ident", "setget"), "")
		if p.at_punct(","):
			b.anon(p.take(), "")
			b.leaf("getter", p.expect_kind("ident", "setget"), "")
		return
	var kw = p.take()
	b.anon(kw, "")
	b.anon(p.expect_punct("=", "setget"), "")
	var getter = kw["text"] == "get"
	if not p.at_kind("ident") or p.at_line_head():
		p.fail(["访问器函数名"], "setget", D.sentence("accGetterName") if getter else D.sentence("accSetterName"), kw["row"], ACC)
		return
	b.leaf("getter" if getter else "setter", p.take(), kw["text"])


static func parse_get_body(p):
	var b = p.b
	b.open("get_body")
	var kw = p.expect_word("get", "setget")
	b.anon(kw, "")
	if p.at_punct("("):
		b.open_anon("()")
		b.anon(p.take(), "")
		b.anon(p.expect_punct(")", "setget"), "")
		b.close("")
	if not p.at_punct(":"):
		p.fail([":", "("], "setget", D.sentence("accGetColonOrParen"), kw["row"], ACC)
		return
	var colon = p.take()
	b.anon(colon, "")
	stmt_mod().parse_body(p, "body", colon)
	b.close("get")


static func parse_set_body(p):
	var b = p.b
	b.open("set_body")
	var kw = p.expect_word("set", "setget")
	b.anon(kw, "")
	if not p.at_punct("("):
		p.fail(["("], "setget", D.sentence("accSetParen"), kw["row"], ACC)
		return
	stmt_mod().parse_parameters_of(p)
	b.set_last_field("")
	var colon = p.expect_punct(":", "setget")
	b.anon(colon, "")
	stmt_mod().parse_body(p, "body", colon)
	b.close("set")


static func parse_const(p, field, anns := []):
	var b = p.b
	b.open("const_statement")
	emit_annotations(p, anns)
	b.anon(p.expect_word("const", "const"), "")
	if not p.at_kind("ident"):
		p.fail(["常量名"], "const")
		return
	b.leaf("name", p.take(), "name")
	if p.at_punct(":=") or (p.at_punct(":") and p.at_punct("=", 1)):
		parse_inferred_of(p)
		E.parse_rhs(p, "value")
	elif p.at_punct(":"):
		b.anon(p.take(), "")
		E.parse_type(p, "type")
		if p.failed:
			return
		b.anon(p.expect_punct("=", "const"), "")
		E.parse_rhs(p, "value")
	else:
		b.anon(p.expect_punct("=", "const"), "")
		E.parse_rhs(p, "value")
	b.close(field)


static func parse_signal(p, field, anns := []):
	var b = p.b
	b.open("signal_statement")
	emit_annotations(p, anns)
	b.anon(p.expect_word("signal", "signal"), "")
	if not p.at_kind("ident"):
		p.fail(["信号名"], "signal")
		return
	b.leaf("name", p.take(), "name")
	if p.at_punct("("):
		stmt_mod().parse_parameters_of(p)
	b.close(field)


static func parse_class_name(p, field, anns := []):
	var b = p.b
	b.open("class_name_statement")
	emit_annotations(p, anns)
	b.anon(p.expect_word("class_name", "class_name"), "")
	if not p.at_kind("ident"):
		p.fail(["类名"], "class_name")
		return
	b.leaf("name", p.take(), "name")
	if p.at_punct(","):
		b.anon(p.take(), "")
		if not p.at_kind("str-start"):
			p.fail(["图标路径"], "class_name")
			return
		E.parse_string(p, "icon_path")
	if p.at_word("extends") and p.same_line(-1):
		parse_extends(p, "extends")
	b.close(field)


static func parse_extends(p, field, anns := []):
	var b = p.b
	b.open("extends_statement")
	emit_annotations(p, anns)
	b.anon(p.expect_word("extends", "extends"), "")
	if p.at_kind("str-start"):
		E.parse_string(p, "")
	else:
		E.parse_type(p, "")
	b.close(field)


static func parse_class_definition(p, field, anns := []):
	var b = p.b
	b.open("class_definition")
	emit_annotations(p, anns)
	b.anon(p.expect_word("class", "class"), "")
	if not p.at_kind("ident"):
		p.fail(["类名"], "class")
		return
	b.leaf("name", p.take(), "name")
	if p.at_word("extends") and p.same_line(-1):
		parse_extends(p, "extends")
	var colon = p.expect_punct(":", "class")
	b.anon(colon, "")
	stmt_mod().parse_body(p, "body", colon, "class_body")
	b.close(field)


static func parse_enum_definition(p, field):
	var b = p.b
	b.open("enum_definition")
	b.anon(p.expect_word("enum", "enum"), "")
	if p.at_kind("ident"):
		b.leaf("name", p.take(), "name")
	b.open("enumerator_list")
	b.anon(p.expect_punct("{", "enum"), "")
	if not p.at_punct("}"):
		while true:
			b.flush()
			parse_enumerator(p)
			if p.failed:
				return
			if not p.at_punct(","):
				break
			b.anon(p.take(), "")
			if p.at_punct("}"):
				break
	b.flush()
	b.anon(p.expect_punct("}", "enum"), "")
	b.close("body")
	b.close(field)


static func parse_enumerator(p):
	var b = p.b
	b.open("enumerator")
	if not p.at_kind("ident"):
		p.fail(["枚举成员名"], "enum")
		return
	b.leaf("identifier", p.take(), "left")
	if p.at_punct("="):
		b.anon(p.take(), "")
		E.parse_rhs(p, "right")
	b.close("")


static func parse_function(p, field, anns := [], static_kw = null, members := false):
	var b = p.b
	var ctor = not members and p.at_word("_init", 1)
	b.open("constructor_definition" if ctor else "function_definition")
	emit_annotations(p, anns)
	if static_kw != null:
		b.leaf("static_keyword", static_kw, "")
	b.anon(p.expect_word("func", "func"), "")
	if ctor:
		b.anon(p.take(), "")
	elif p.at_kind("ident"):
		b.leaf("name", p.take(), "name")
	stmt_mod().parse_parameters_of(p)
	if p.failed:
		return
	if ctor and p.at_punct("."):
		b.anon(p.take(), "")
		parse_arguments_of(p, "arguments")
	if p.at_punct("->") and not p.at_line_head():
		b.anon(p.take(), "")
		E.parse_type(p, "return_type")
	if p.at_punct(":") and not p.at_line_head():
		var colon = p.take()
		b.anon(colon, "")
		stmt_mod().parse_body(p, "body", colon)
	elif p.at_punct(";"):
		b.anon(p.take(), "")
	b.close(field)
