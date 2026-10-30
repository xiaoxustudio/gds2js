extends SceneTree

var src = ""
var stack = []
var pending = []


func _initialize():
	src = "var x = 1 + \"é😀\"\n"
	build()
	var root = root_finish(src.length())
	dump(root, 0)
	print("z|", stack.size(), "|", pending.size())
	dump(rebuild_with_lift(), 0)
	quit()


func tok(kind, start, len, row, col):
	return {"kind": kind, "start": start, "end": start + len, "row": row, "col": col}


func pos_of(t):
	return {"index": t["start"], "row": t["row"], "col": t["col"]}


func mk(type, is_named, field_name, start, end, children):
	return {
		"type": type,
		"text": src.substr(start["index"], end - start["index"]),
		"isNamed": is_named,
		"hasError": false,
		"startIndex": start["index"],
		"endIndex": end,
		"startPosition": {"row": start["row"], "column": start["col"]},
		"fieldName": field_name,
		"children": children,
		"namedChildren": named_of(children),
	}


func named_of(children):
	var out = []
	for c in children:
		if c["isNamed"]:
			out.append(c)
	return out


func open(type):
	stack.append({"type": type, "isNamed": true, "children": [], "start": null, "end": null})


func open_anon(type, t):
	stack.append({"type": type, "isNamed": false, "children": [], "start": pos_of(t), "end": null})


func close(field_name):
	var d = stack.pop_back()
	var kids = d["children"]
	var start = d["start"]
	if start == null:
		if kids.is_empty():
			return null
		start = {"index": kids[0]["startIndex"], "row": kids[0]["startPosition"]["row"], "col": kids[0]["startPosition"]["column"]}
	var end = d["end"]
	if end == null:
		end = start["index"] if kids.is_empty() else kids[kids.size() - 1]["endIndex"]
	var node = mk(d["type"], d["isNamed"], field_name, start, end, kids)
	if not stack.is_empty():
		stack[stack.size() - 1]["children"].append(node)
	return node


func leaf(type, t, field_name):
	flush()
	stack[stack.size() - 1]["children"].append(mk(type, true, field_name, pos_of(t), t["end"], []))


func anon(t, field_name):
	flush()
	stack[stack.size() - 1]["children"].append(mk(t["kind"], false, field_name, pos_of(t), t["end"], []))


func attach(node, field_name):
	node["fieldName"] = field_name
	stack[stack.size() - 1]["children"].append(node)


func set_last_field(field_name):
	var kids = stack[stack.size() - 1]["children"]
	kids[kids.size() - 1]["fieldName"] = field_name


func lift_last():
	var kids = stack[stack.size() - 1]["children"]
	return kids.pop_back()


func mark():
	return stack[stack.size() - 1]["children"].size()


func splice_from(m):
	var kids = stack[stack.size() - 1]["children"]
	var out = []
	for i in range(m, kids.size()):
		out.append(kids[i])
	while kids.size() > m:
		kids.pop_back()
	return out[0]


func set_end(t):
	stack[stack.size() - 1]["end"] = t["end"]


func stash_comment(t):
	pending.append(mk("comment", true, "", pos_of(t), t["end"], []))


func flush():
	if pending.is_empty():
		return
	for n in pending:
		stack[stack.size() - 1]["children"].append(n)
	pending = []


func root_finish(end_index):
	flush()
	var root = close("")
	root["endIndex"] = end_index
	root["text"] = src.substr(root["startIndex"], end_index - root["startIndex"])
	return root


func dump(n, depth):
	var sp = n["startPosition"]
	print("n|", depth, "|", n["type"], "|", n["isNamed"], "|", n["hasError"], "|", n["fieldName"], "|", n["startIndex"], "|", n["endIndex"], "|", sp["row"], "|", sp["column"], "|", n["text"], "|", n["children"].size(), "|", n["namedChildren"].size())
	for c in n["children"]:
		dump(c, depth + 1)


func build():
	open("source")
	leaf("identifier", tok("ident", 0, 3, 0, 0), "left")
	anon(tok("=", 3, 1, 0, 3), "")
	open("binary_operator")
	anon(tok("int", 4, 1, 0, 4), "left")
	anon(tok("+", 6, 1, 0, 6), "operator")
	leaf("string", tok("str", 8, 6, 0, 8), "right")
	var extra = tok("cmt", 14, 5, 0, 14)
	stash_comment(extra)
	close("right")
	set_last_field("right")
	var detached = lift_last()
	attach(detached, "tail")
	set_end(tok("cmt", 19, 1, 0, 19))
	open_anon("()", tok("(", 20, 1, 0, 20))
	leaf("identifier", tok("ident", 21, 1, 0, 21), "")
	close("")


func rebuild_with_lift():
	stack = []
	pending = []
	src = "lift me"
	open("source")
	leaf("identifier", tok("ident", 0, 4, 0, 0), "left")
	var inner = splice_from(0)
	open("wrapped")
	attach(inner, "inner")
	close("body")
	set_last_field("tail")
	return root_finish(7)
