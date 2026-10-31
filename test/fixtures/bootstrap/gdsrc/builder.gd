class Draft:
	var kind_type = ""
	var is_named = true
	var id = 0
	var children = []
	var start = null
	var end = null


class Builder:
	var src = ""
	var root_type = "source"
	var stack = []
	var pending = []
	var next_id = 1
	var parents = {}

	func boot(text, root_name := "source"):
		src = text
		root_type = root_name
		stack = []
		pending = []
		next_id = 1
		parents = {}
		var root = Draft.new()
		root.id = next_id
		next_id += 1
		root.kind_type = root_name
		root.is_named = true
		stack.append(root)

	func pos(t):
		return {"index": t["start"], "row": t["row"], "col": t["col"]}

	func mk(type, is_named, field_name, start, end, children):
		var id = next_id
		next_id += 1
		return mk_id(id, type, is_named, field_name, start, end, children)

	func mk_id(id, type, is_named, field_name, start, end, children):
		return {
			"id": id,
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

	func open(type, start = null):
		var d = Draft.new()
		d.kind_type = type
		d.is_named = true
		d.start = start
		d.id = next_id
		next_id += 1
		stack.append(d)

	func open_anon(type, start):
		var d = Draft.new()
		d.kind_type = type
		d.is_named = false
		d.start = start
		d.id = next_id
		next_id += 1
		stack.append(d)

	func close(field_name := ""):
		var d = stack.pop_back()
		var kids = d.children
		var first = null
		var last = null
		if kids.size() > 0:
			first = kids[0]
			last = kids[kids.size() - 1]
		var start = d.start
		if start == null:
			if first == null:
				return null
			start = {"index": first["startIndex"], "row": first["startPosition"]["row"], "col": first["startPosition"]["column"]}
		var end = d.end
		if end == null:
			end = start["index"] if last == null else last["endIndex"]
		var node = mk_id(d.id, d.kind_type, d.is_named, field_name, start, end, kids)
		if stack.size() > 0:
			var parent = stack[stack.size() - 1]
			parents[node["id"]] = parent.id
			parent.children.append(node)
		return node

	func top():
		return stack[stack.size() - 1]

	func parent_id(node):
		if parents.has(node["id"]):
			return parents[node["id"]]
		return -1

	func bind_parent(node, parent_id):
		parents[node["id"]] = parent_id

	func push_child(node):
		parents[node["id"]] = top().id
		top().children.append(node)

	func anon(t, field_name := ""):
		flush()
		push_child(mk(t["text"], false, field_name, pos(t), t["end"], []))

	func anon_as(type, t, field_name := ""):
		flush()
		push_child(mk(type, false, field_name, pos(t), t["end"], []))

	func leaf(type, t, field_name := ""):
		flush()
		push_child(mk(type, true, field_name, pos(t), t["end"], []))

	func attach(node, field_name):
		node["fieldName"] = field_name
		var owner = top()
		parents[node["id"]] = owner.id
		owner.children.append(node)

	func set_last_field(field_name):
		var kids = top().children
		kids[kids.size() - 1]["fieldName"] = field_name

	func lift_last():
		var kids = top().children
		return kids.pop_back()

	func mark():
		return top().children.size()

	func set_end(t):
		top().end = t["end"]

	func splice_from(m):
		var kids = top().children
		var taken = []
		for k in range(m, kids.size()):
			taken.append(kids[k])
		while kids.size() > m:
			kids.pop_back()
		return taken[0]

	func splice_all(m):
		var kids = top().children
		var taken = []
		for k in range(m, kids.size()):
			taken.append(kids[k])
		while kids.size() > m:
			kids.pop_back()
		return taken

	func stash_comment(t):
		pending.append(mk("comment", true, "", pos(t), t["end"], []))

	func stash_continuation(t):
		pending.append(mk("line_continuation", true, "", pos(t), t["end"], []))

	func flush():
		if pending.is_empty():
			return
		for n in pending:
			push_child(n)
		pending = []

	func pending_count():
		return pending.size()

	func root(end_index):
		flush()
		while stack.size() > 1:
			close("body")
		var node = close("")
		if node == null:
			node = mk(root_type, true, "", {"index": 0, "row": 0, "col": 0}, end_index, [])
		node["endIndex"] = end_index
		node["text"] = src.substr(node["startIndex"], end_index - node["startIndex"])
		return node


static func dump(node, depth, rows):
	rows.append("%s|%s|%s|%s|%s|%d|%d|%d|%d|%d|%d" % [str(depth), node["type"], node["fieldName"], yes_no(node["isNamed"]), yes_no(node["hasError"]), node["startIndex"], node["endIndex"], node["startPosition"]["row"], node["startPosition"]["column"], node["children"].size(), node["namedChildren"].size()])
	for c in node["children"]:
		dump(c, depth + 1, rows)
	return rows


static func yes_no(v):
	return "T" if v else "-"
