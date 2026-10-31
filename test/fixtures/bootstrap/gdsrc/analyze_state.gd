class Scope:
	var vars = {}
	var parent = null
	var self_ok = null
	var is_local = false

	static func make(names, parent_scope, self_ok_arg = null, local = false):
		var s = Scope.new()
		for n in names:
			s.vars[n] = true
		s.parent = parent_scope
		s.self_ok = self_ok_arg
		s.is_local = local
		return s

	func has(name):
		if vars.has(name):
			return true
		if parent != null:
			return parent.has(name)
		return false

	func has_local(name):
		if not is_local:
			return false
		if vars.has(name):
			return true
		if parent != null:
			return parent.has_local(name)
		return false

	func func_child(names, self_ok_arg = null):
		return Scope.make(names, self, self_ok_arg, true)

	func allows_self():
		if self_ok != null:
			return self_ok
		if parent != null:
			return parent.allows_self()
		return false

	func child(names, self_ok_arg = null):
		return Scope.make(names, self, self_ok_arg, is_local)

	func declare(name):
		vars[name] = true


static func new_scope(names, parent, self_ok = null, local = false):
	return Scope.make(names, parent, self_ok, local)


static var run_state = null
static var mark_seq = 0


static func new_run():
	return {
		"owner": "",
		"dictIntReads": {},
		"posReadLabels": {},
		"boundFaces": {},
		"globalValueReads": {},
		"nativeClassReads": {},
		"hostMethodReads": {},
		"enginePropReads": {},
		"lambdaCaptures": {},
		"outerNames": {},
		"hostValueMethods": {},
		"enginePropFace": {},
		"hostStaticCtx": null,
		"classFaceReceivers": {},
	}


static func get_run():
	return run_state


static func reset_run(owner):
	run_state = new_run()
	run_state["owner"] = owner
	return run_state


static func next_mark_seq():
	mark_seq += 1
	return mark_seq


static func decl_names(d):
	var out = []
	for v in d["vars"]:
		out.append(v["name"])
	for s in d["signals"]:
		out.append(s["name"])
	for f in d["funcs"]:
		out.append(f["name"])
	for c in d["innerClasses"]:
		out.append(c["name"])
	return out


static func di_key(r, line, col):
	return str(r["owner"]) + "#" + str(line) + ":" + str(col)


static func gv_key(r, name, line, col):
	return str(r["owner"]) + "#" + str(name) + "@" + str(line) + ":" + str(col)


static func cap_key(r, line, col):
	return str(r["owner"]) + "@" + str(line) + ":" + str(col)


static func parse_typed(name):
	if not (name.begins_with("Array[") or name.begins_with("Dictionary[")):
		return null
	if not name.ends_with("]"):
		return null
	var open = name.find("[")
	var inner = name.substr(open + 1, name.length() - open - 2)
	if inner.contains("["):
		return null
	if name.begins_with("Array["):
		return {"decl": name, "kind": "Array", "elem": inner.strip_edges()}
	var parts = []
	for p in inner.split(","):
		parts.append(p.strip_edges())
	if parts.size() != 2:
		return null
	return {"decl": name, "kind": "Dictionary", "key": parts[0], "val": parts[1]}
