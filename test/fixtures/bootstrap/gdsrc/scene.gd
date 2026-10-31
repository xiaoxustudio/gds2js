static func _is_word(ch):
	return (ch >= "a" and ch <= "z") or (ch >= "A" and ch <= "Z") or (ch >= "0" and ch <= "9") or ch == "_"


static func _word_at(s, at):
	var i = at
	while i < s.length() and _is_word(s[i]):
		i += 1
	return s.substr(at, i - at)


static func _err(code, message):
	return {"__error": code, "message": message}


static func attrs(head):
	var out = {}
	var quoted = {}
	var i = 0
	while i < head.length():
		var ch = head[i]
		if not _is_word(ch):
			i += 1
			continue
		var key = _word_at(head, i)
		i += key.length()
		while i < head.length() and head[i] == " ":
			i += 1
		if i >= head.length() or head[i] != "=":
			continue
		i += 1
		while i < head.length() and head[i] == " ":
			i += 1
		if i < head.length() and head[i] == "\"":
			var end = head.find("\"", i + 1)
			if end < 0:
				break
			out[key] = head.substr(i + 1, end - i - 1)
			quoted[key] = true
			i = end + 1
			continue
		var start = i
		while i < head.length() and not head[i] == " ":
			var c = head[i]
			var ok = _is_word(c) or c == "." or c == "\"" or c == "-"
			if not ok:
				break
			i += 1
		if i > start and (i >= head.length() or head[i] == " ") and not quoted.has(key) and not out.has(key):
			out[key] = head.substr(start, i - start)
	return out


static func parse_scene(text):
	var scripts = {}
	var by_path = {}
	var root = null
	var current = null
	var header = false
	for raw in text.split("\n"):
		var line = raw.strip_edges()
		if line == "" or line.begins_with(";"):
			continue
		if line.begins_with("[") and line.ends_with("]"):
			var body = line.substr(1, line.length() - 2)
			var tag = _word_at(body, 0)
			if tag == "gd_scene":
				header = true
				current = null
				continue
			var a = attrs(body)
			if tag == "ext_resource":
				if a.get("type") != "Script":
					return _err("scene-ext-resource", "场景里的 ext_resource 只量过 type=\"Script\"（收到 " + str(a.get("type")) + "）")
				if not a.has("path"):
					return _err("scene-ext-resource", "ext_resource 少了 path")
				scripts[a.get("id", "")] = a["path"]
				continue
			if tag == "sub_resource":
				return _err("scene-sub-resource", "场景里的 sub_resource 段没建模")
			if tag != "node":
				return _err("scene-section", "场景文件里的 [" + tag + "] 段没建模")
			var name = a.get("name")
			var cls = a.get("type")
			if name == null:
				return _err("scene-node", "场景节点段少了 name")
			if cls == null:
				return _err("scene-node", "场景节点只量过带 type= 的那一形（instance= 没建模）")
			if a.has("instance") or a.has("groups"):
				return _err("scene-node", "场景节点的 instance= / groups= 没建模")
			var node = {"name": name, "cls": cls, "script": null, "children": []}
			if not a.has("parent"):
				if root != null:
					return _err("scene-node", "场景里出现第二个不带 parent= 的节点")
				root = node
				by_path["."] = node
			else:
				var parent = a["parent"]
				if root == null:
					return _err("scene-node", "场景的第一个节点就带了 parent=")
				if not by_path.has(parent):
					return _err("scene-parent", "场景节点的 parent=\"" + parent + "\" 指不到已读出的节点")
				by_path[parent]["children"].append(node)
				by_path[name if parent == "." else parent + "/" + name] = node
			current = node
			continue
		var key = _word_at(line, 0)
		var i = key.length()
		while i < line.length() and line[i] == " ":
			i += 1
		if key == "" or i >= line.length() or line[i] != "=":
			return _err("scene-line", "场景文件里这一行读不出来：" + line)
		i += 1
		while i < line.length() and line[i] == " ":
			i += 1
		if current == null:
			return _err("scene-line", "场景属性出现在任何 [node] 段之前")
		if key != "script":
			return _err("scene-property", "场景节点的 " + key + "= 属性还没建模")
		var value = line.substr(i)
		var at = value.find("ExtResource(")
		if at < 0:
			return _err("scene-property", "场景节点的 script= 只量过 ExtResource(\"id\") 那一形")
		var q1 = value.find("\"", at)
		var q2 = value.find("\"", q1 + 1) if q1 >= 0 else -1
		if q2 < 0:
			return _err("scene-property", "场景节点的 script= 只量过 ExtResource(\"id\") 那一形")
		var ref = value.substr(q1 + 1, q2 - q1 - 1)
		if not scripts.has(ref):
			return _err("scene-property", "script 指的 ExtResource id 不在表里")
		current["script"] = scripts[ref]
	if not header:
		return _err("scene-header", "场景文件缺 [gd_scene] 头")
	if root == null:
		return _err("scene-root", "场景里没有根节点")
	return {"root": root}
