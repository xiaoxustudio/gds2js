const BRACKET_NODES = ["parenthesized_expression", "array", "dictionary", "arguments", "subscript"]


static func loc(n):
	return {"line": n["startPosition"]["row"] + 1, "col": n["startPosition"]["column"] + 1}


static func field(n, name):
	for c in n["children"]:
		if c["fieldName"] == name:
			return c
	return null


static func need(n, what):
	if n == null:
		return {"code": "missing-field", "message": "缺少 " + what}
	return n


static func is_error(v):
	return v is Dictionary and v.has("code") and v.has("message")


static func operator_of(n):
	for c in n["children"]:
		if not c["isNamed"]:
			return c["text"]
	return ""


static func index_parents(n, idx):
	idx["types"][n["id"]] = n["type"]
	for c in n["children"]:
		idx["parents"][c["id"]] = n["id"]
		index_parents(c, idx)


static func in_brackets(n, idx):
	var id = n["id"]
	while idx["parents"].has(id):
		var up = idx["parents"][id]
		if BRACKET_NODES.has(idx["types"][up]):
			return true
		id = up
	return false


static func token_of(n, text):
	for c in n["children"]:
		if not c["isNamed"] and c["text"] == text:
			return c
	return null


static func continuation_err(sentence, at):
	var out = {"code": "line-continuation", "sentence": sentence, "line": 0}
	if at != null:
		out["line"] = at["startPosition"]["row"] + 1
	return out


static func syntax_err_of(tree):
	var issues = tree["syntaxErrors"]
	if issues.size() == 0:
		return null
	var issue = issues[0]
	var sentence = issue["sentence"]
	if sentence == "":
		sentence = "语法畸形未支持：" + issue["context"] + " 在 " + str(issue["row"] + 1) + ":" + str(issue["column"] + 1) + " 撞上 [" + issue["got"] + "]"
	return {"code": issue["code"], "sentence": sentence, "line": issue["reportRow"] + 1}


static func check_after_token(n, token, value, sentence):
	if token != null and value != null and value["startPosition"]["row"] > token["startPosition"]["row"]:
		return continuation_err(sentence, token)
	return null


static func operator_token(n):
	for c in n["children"]:
		if not c["isNamed"]:
			return c
	return null


static func last_row(n):
	var row = n["startPosition"]["row"]
	var text = n["text"]
	for i in text.length():
		if text[i] == "\n":
			row += 1
	return row


static func check_colon_here(n, sentence):
	var kids = n["children"]
	var at = -1
	for i in kids.size():
		if not kids[i]["isNamed"] and kids[i]["text"] == ":":
			at = i
			break
	if at < 1:
		return null
	var colon = kids[at]
	var prev = kids[at - 1]
	if colon["startPosition"]["row"] > last_row(prev):
		return continuation_err(sentence, prev)
	return null


static func named(n):
	return n["namedChildren"]


static func lower_type(n):
	if n["type"] == "inferred_type":
		return {"kind": "variant"}
	return {"kind": "named", "name": n["text"]}


static func index_tree(root):
	var idx = {"parents": {}, "types": {}}
	index_parents(root, idx)
	return idx


static func order_of(root, out):
	out.append(root)
	for c in root["children"]:
		order_of(c, out)
	return out
