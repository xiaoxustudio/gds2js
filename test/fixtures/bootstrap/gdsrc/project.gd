const SR = preload("res://source.gd")
const LO = preload("res://lower.gd")
const SC = preload("res://scene.gd")
const AZ = preload("res://analyze_idx.gd")
const ME = preload("res://module_emit.gd")
const GLOB = preload("res://globals.gd")

const RES_PREFIX = "res://"
const HOST_BASES = {"SceneTree": true}
const SCRIPT_NODE_BASES = {"Node": true, "Node2D": true, "Control": true, "Node3D": true}


static func _err(code, message):
	return {"__error": code, "message": message}


static func _is_err(x):
	return x is Dictionary and x.has("__error")


static func _to_slash(p):
	return String(p).replace("\\", "/")


static func _is_abs(p):
	if p.begins_with("/"):
		return true
	return p.length() >= 2 and p.substr(1, 1) == ":"


static func _cwd() -> String:
	var da = DirAccess.open(".")
	if da == null:
		return ""
	return _to_slash(da.get_current_dir())


static func _parts(abs_path):
	var s = abs_path
	var drive = ""
	if s.length() >= 2 and s.substr(1, 1) == ":":
		drive = s.substr(0, 2)
		s = s.substr(2)
	var parts = []
	for seg in s.split("/"):
		if seg == "" or seg == ".":
			continue
		if seg == "..":
			if parts.size() > 0:
				parts.pop_back()
			continue
		parts.append(seg)
	return {"drive": drive, "parts": parts}


static func _norm_abs(p):
	var s = _to_slash(p)
	var split = _parts(s)
	var rest = "/".join(split["parts"])
	return split["drive"] + "/" + rest


static func _resolve(p, base):
	var s = _to_slash(p)
	if _is_abs(s):
		return _norm_abs(s)
	var b = base
	if b == null or b == "":
		b = _cwd()
	return _norm_abs(b + "/" + s)


static func _dirname(p):
	var s = _norm_abs(p)
	var idx = s.rfind("/")
	if idx <= 0:
		return s
	if idx == 2 and s.substr(1, 1) == ":":
		return s.substr(0, 3)
	return s.substr(0, idx)


static func _basename(p):
	var s = _to_slash(p)
	var idx = s.rfind("/")
	if idx < 0:
		return s
	return s.substr(idx + 1)


static func _extname(p):
	var b = _basename(p)
	var idx = b.rfind(".")
	if idx <= 0:
		return ""
	return b.substr(idx)


static func _relative(base, target):
	var a = _parts(_norm_abs(base))
	var b = _parts(_norm_abs(target))
	if a["drive"] != b["drive"]:
		return _norm_abs(target)
	var ap = a["parts"]
	var bp = b["parts"]
	var i = 0
	while i < ap.size() and i < bp.size() and ap[i] == bp[i]:
		i += 1
	var out = []
	for _k in range(ap.size() - i):
		out.append("..")
	for k in range(i, bp.size()):
		out.append(bp[k])
	return "/".join(out)


static func _file_exists(p):
	return FileAccess.file_exists(p)


static func _dir_exists(p):
	return DirAccess.dir_exists_absolute(p)


static func _read_text(p) -> String:
	var f = FileAccess.open(p, FileAccess.READ)
	if f == null:
		return ""
	var text = f.get_as_text()
	f.close()
	return text


static func _lines(text) -> Array:
	var out = []
	for raw in String(text).split("\n"):
		out.append(raw.trim_suffix("\r"))
	return out


static func _config_name_of(text):
	for line in _lines(text):
		if line.begins_with("config/name="):
			var rest = line.substr("config/name=".length())
			if rest.begins_with("\""):
				rest = rest.substr(1)
			var end = rest.find("\"")
			if end >= 0:
				rest = rest.substr(0, end)
			if rest != "":
				return rest
	return null


static func project_config_name(res_root):
	var p = _norm_abs(res_root + "/project.godot")
	if not _file_exists(p):
		return null
	return _config_name_of(_read_text(p))


static func main_scene_file(res_root):
	var p = _norm_abs(res_root + "/project.godot")
	if not _file_exists(p):
		return null
	for line in _lines(_read_text(p)):
		if line.begins_with("run/main_scene=\""):
			var rest = line.substr("run/main_scene=\"".length())
			var end = rest.find("\"")
			if end < 0:
				return null
			var target = rest.substr(0, end)
			if not target.begins_with(RES_PREFIX):
				return null
			var abs = _res_to_abs(normalize_res(target), res_root)
			return abs if _file_exists(abs) else null
	return null


static func _to_res_path(abs_path, res_root):
	var rel = _relative(res_root, abs_path)
	return RES_PREFIX + rel


static func normalize_res(res_path):
	var rest = res_path.substr(RES_PREFIX.length())
	var out = []
	for part in rest.split("/"):
		if part == "." or part == "":
			continue
		if part == "..":
			if out.size() > 0:
				out.pop_back()
			continue
		out.append(part)
	return RES_PREFIX + "/".join(out)


static func resolve_gd_path(from_res, target):
	if target.begins_with(RES_PREFIX):
		return normalize_res(target)
	var from_dir = _dirname(from_res)
	var base = RES_PREFIX
	if from_dir != "" and from_dir != RES_PREFIX and from_dir != "res:":
		base = from_dir + "/"
	return normalize_res(base + target)


static func _res_to_abs(res_path, res_root):
	return _norm_abs(res_root + "/" + res_path.substr(RES_PREFIX.length()))


static func _climbs_above_root(target, from_abs, res_root):
	if target.begins_with(RES_PREFIX):
		return false
	var rel = _relative(res_root, _resolve(target, _dirname(from_abs)))
	return rel == "" or rel.begins_with("..") or _is_abs(rel)


static func _derived_class_name(res_path):
	var raw = _basename(res_path)
	var ext = _extname(raw)
	if ext != "":
		raw = raw.substr(0, raw.length() - ext.length())
	var out = ""
	for i in range(raw.length()):
		var ch = raw.substr(i, 1)
		if (ch >= "A" and ch <= "Z") or (ch >= "a" and ch <= "z") or (ch >= "0" and ch <= "9") or ch == "_":
			out += ch
		else:
			out += "_"
	if out == "":
		return ""
	if out.substr(0, 1) >= "0" and out.substr(0, 1) <= "9":
		return "_" + out
	return out.substr(0, 1).to_upper() + out.substr(1)


static func _module_class_name(m, res_path):
	var derived = _derived_class_name(res_path)
	for c in m["innerClasses"]:
		if c["name"] == derived:
			return derived + "Module"
	return derived


static func _walk_expr(e, out):
	if e == null or not (e is Dictionary):
		return
	out.append(e)
	match e.get("kind"):
		"binary":
			_walk_expr(e["left"], out)
			_walk_expr(e["right"], out)
		"unary", "await", "is", "as":
			_walk_expr(e["operand"], out)
		"call":
			_walk_expr(e["callee"], out)
			for a in e["args"]:
				_walk_expr(a, out)
		"attribute":
			_walk_expr(e["obj"], out)
		"index":
			_walk_expr(e["obj"], out)
			_walk_expr(e["index"], out)
		"array":
			for a2 in e["items"]:
				_walk_expr(a2, out)
		"dict":
			for en in e["entries"]:
				_walk_expr(en["key"], out)
				_walk_expr(en["value"], out)
		"lambda":
			for s in e["body"]:
				_walk_stmt(s, out)


static func _walk_stmt(s, out):
	if s == null or not (s is Dictionary):
		return
	match s.get("kind"):
		"expr":
			_walk_expr(s["expr"], out)
		"var":
			if s.get("init") != null:
				_walk_expr(s["init"], out)
		"assign":
			_walk_expr(s["target"], out)
			_walk_expr(s["value"], out)
		"if":
			for br in s["branches"]:
				if br.get("cond") != null:
					_walk_expr(br["cond"], out)
				for b in br["body"]:
					_walk_stmt(b, out)
		"for":
			_walk_expr(s["iter"], out)
			for b2 in s["body"]:
				_walk_stmt(b2, out)
		"while":
			_walk_expr(s["cond"], out)
			for b3 in s["body"]:
				_walk_stmt(b3, out)
		"match":
			_walk_expr(s["subject"], out)
			for arm in s["arms"]:
				if arm.get("guard") != null:
					_walk_expr(arm["guard"], out)
				for b4 in arm["body"]:
					_walk_stmt(b4, out)
		"return":
			if s.get("value") != null:
				_walk_expr(s["value"], out)


static func _walk_class_exprs(c, out):
	for v in c["vars"]:
		if v.get("init") != null:
			_walk_expr(v["init"], out)
	for f in c["funcs"]:
		for s in f["body"]:
			_walk_stmt(s, out)
	for inner in c["innerClasses"]:
		_walk_class_exprs(inner, out)


static func walk_module_exprs(m, out):
	for v in m["vars"]:
		if v.get("init") != null:
			_walk_expr(v["init"], out)
	for f in m["funcs"]:
		for s in f["body"]:
			_walk_stmt(s, out)
	for c in m["innerClasses"]:
		_walk_class_exprs(c, out)


static func _type_ref_name(t) -> Variant:
	if t != null and t.get("kind") == "named":
		return t["name"]
	return null


static func _extends_ref_text(raw) -> Variant:
	if raw == null:
		return null
	var trimmed = String(raw).strip_edges()
	if trimmed.length() >= 2 and (trimmed.begins_with("\"") or trimmed.begins_with("'")) and trimmed.ends_with(trimmed.substr(0, 1)):
		return trimmed.substr(1, trimmed.length() - 2)
	return trimmed


static func _bare_ext(ext):
	var idx = ext.find("[")
	if idx < 0:
		return ext
	return ext.substr(0, idx)


static func _add_pattern_names(p, names):
	if p.get("kind") == "bind":
		names.append(p["name"])
	elif p.get("kind") == "array":
		for it in p["items"]:
			_add_pattern_names(it, names)
	elif p.get("kind") == "dict":
		for en in p["entries"]:
			_add_pattern_names(en["pattern"], names)


static func _add_stmt_names(s, names):
	if s.get("kind") == "var":
		names.append(s["name"])
	if s.get("kind") == "for":
		names.append(s["var"])
	if s.get("kind") == "if":
		for b in s["branches"]:
			for x in b["body"]:
				_add_stmt_names(x, names)
	if s.get("kind") == "for" or s.get("kind") == "while":
		for x2 in s["body"]:
			_add_stmt_names(x2, names)
	if s.get("kind") == "match":
		for a in s["arms"]:
			for x3 in a["body"]:
				_add_stmt_names(x3, names)
			_add_pattern_names(a["pattern"], names)


static func _add_class_names(c, names):
	for f2 in c["funcs"]:
		for p3 in f2["params"]:
			names.append(p3["name"])
		for s3 in f2["body"]:
			_add_stmt_names(s3, names)
	for v in c["vars"]:
		names.append(v["name"])
	for inner in c["innerClasses"]:
		_add_class_names(inner, names)


static func _local_names(m):
	var names = []
	for f in m["funcs"]:
		for p2 in f["params"]:
			names.append(p2["name"])
		for s2 in f["body"]:
			_add_stmt_names(s2, names)
	for c2 in m["innerClasses"]:
		_add_class_names(c2, names)
	return names


static func _class_file(name, loaded, class_index) -> Variant:
	var res_path = class_index.get(name)
	if res_path == null:
		return null
	return loaded.get(res_path)


static func _base_module(l, loaded, class_index) -> Variant:
	var ext = _extends_ref_text(l["module"].get("extends"))
	if ext == null:
		return null
	if ext.ends_with(".gd"):
		return loaded.get(resolve_gd_path(l["resPath"], ext))
	var bare = _bare_ext(ext)
	if class_index.has(bare):
		return _class_file(bare, loaded, class_index)
	return null


static func _inner_classes_by_class(loaded):
	var out = {}
	for l in loaded.values():
		var names = []
		for c in l["module"]["innerClasses"]:
			names.append(c["name"])
		if names.size() > 0:
			out[l["jsName"]] = names
	return out


static func _preloaded_res_paths(loaded):
	var out = {}
	for l in loaded.values():
		var exprs = []
		walk_module_exprs(l["module"], exprs)
		for e in exprs:
			if e.get("kind") != "call" or e["callee"].get("kind") != "ident":
				continue
			if e["callee"]["name"] != "preload" and e["callee"]["name"] != "load":
				continue
			if e["args"].is_empty():
				continue
			var a = e["args"][0]
			if a.get("kind") != "lit" or a.get("lit") != "string":
				continue
			out[normalize_res(resolve_gd_path(l["resPath"], String(a["value"])))] = true
	return out


static func _consts_by_class(loaded):
	var out = {}
	for l in loaded.values():
		var names = []
		for v in l["module"]["vars"]:
			if v.get("isConst") == true:
				names.append(v["name"])
		if names.size() > 0:
			out[l["jsName"]] = names
	return out


static func _inherited_members(l, loaded, class_index):
	var names = []
	var seen = {}
	seen[l["resPath"]] = true
	var cur = _base_module(l, loaded, class_index)
	while cur != null and not seen.has(cur["resPath"]):
		seen[cur["resPath"]] = true
		for v in cur["module"]["vars"]:
			names.append(v["name"])
		for f in cur["module"]["funcs"]:
			names.append(f["name"])
		for s in cur["module"]["signals"]:
			names.append(s["name"])
		cur = _base_module(cur, loaded, class_index)
	return names


static func _host_on_chain(l, loaded, class_index, entry_res_set, seen = null):
	if seen == null:
		seen = {}
	if seen.has(l["resPath"]):
		return false
	seen[l["resPath"]] = true
	var ext = _extends_ref_text(l["module"].get("extends"))
	if ext == null:
		return entry_res_set.has(l["resPath"])
	if HOST_BASES.has(_bare_ext(ext)):
		return true
	var parent = _base_module(l, loaded, class_index)
	if parent == null:
		return false
	return _host_on_chain(parent, loaded, class_index, entry_res_set, seen)


static func _resolve_base(l, loaded, class_index, res_root, opts) -> Variant:
	var ext = _extends_ref_text(l["module"].get("extends"))
	if ext == null:
		return null
	if ext.ends_with(".gd"):
		var dep_res = resolve_gd_path(l["resPath"], ext)
		var dep = loaded.get(dep_res)
		if dep == null:
			return _err("extends-missing", "extends 的脚本未找到：" + ext)
		return {"jsName": dep["jsName"], "spec": {"kind": "import", "name": dep["jsName"], "from": _js_import_specifier(l, dep, opts)}}
	var bare = _bare_ext(ext)
	if HOST_BASES.has(bare):
		return {"jsName": null, "spec": {"kind": "host"}}
	if class_index.has(bare):
		var dep2 = _class_file(bare, loaded, class_index)
		return {"jsName": dep2["jsName"], "spec": {"kind": "import", "name": dep2["jsName"], "from": _js_import_specifier(l, dep2, opts)}}
	if SCRIPT_NODE_BASES.has(bare):
		return {"jsName": null, "spec": {"kind": "engine", "name": bare}}
	if GLOB.is_engine_class(bare):
		return _err("engine-base", "extends 引擎类型 " + bare + " 还没建模（脚本基类只量过 Node、Node2D、Control 与 Node3D）")
	return _err("extends-unknown", "无法解析 extends 目标：" + ext)


static func _js_path_for(l, opts):
	var rel = l["resPath"].substr(RES_PREFIX.length())
	if rel.ends_with(".gd"):
		rel = rel.substr(0, rel.length() - 3) + ".mts"
	return _norm_abs(_resolve(opts["outDir"], "") + "/" + rel)


static func _js_import_specifier(from, target, opts):
	return _rel_from_js(_js_path_for(from, opts), _js_path_for(target, opts))


static func _rel_from_js(from_js_path, abs_target):
	var rel = _relative(_dirname(from_js_path), abs_target)
	if rel.begins_with("."):
		return rel
	return "./" + rel


static func _detect_cycles(loaded, res_root):
	var color = {}
	for k in loaded.keys():
		color[k] = 0
	for l in loaded.values():
		if color[l["resPath"]] == 0:
			var bad = _dfs(l, loaded, color, [])
			if bad != null:
				return bad
	return null


static func _dfs(l, loaded, color, stack):
	color[l["resPath"]] = 1
	var edges = []
	for d in l["strongDeps"].keys():
		edges.append(d)
	var ext = _extends_ref_text(l["module"].get("extends"))
	if ext != null and ext.ends_with(".gd"):
		edges.append(resolve_gd_path(l["resPath"], ext))
	for dep in edges:
		var d2 = loaded.get(dep)
		if d2 == null:
			continue
		var col = color.get(dep)
		if col == 1:
			var path = []
			for s in stack:
				path.append(s)
			path.append(l["resPath"])
			path.append(dep)
			return _err("dependency-cycle", "跨文件依赖成环：" + " → ".join(path))
		if col == 0:
			var sub = []
			for s2 in stack:
				sub.append(s2)
			sub.append(l["resPath"])
			var bad = _dfs(d2, loaded, color, sub)
			if bad != null:
				return bad
	color[l["resPath"]] = 2
	return null


static func _scene_child(node, scene_deps):
	if node["cls"] != "Node" and node["cls"] != "Node2D":
		return _err("scene-node-class", "场景节点的类型 " + node["cls"] + " 造不出来（只量过 Node 与 Node2D）")
	var expr = "rt.engineClassNew(" + JSON.stringify(node["cls"]) + ")"
	if node.get("script") != null:
		var dep = scene_deps.get(normalize_res(node["script"]))
		expr = "new " + dep["jsName"] + "()"
	var children = []
	for c in node["children"]:
		var sub = _scene_child(c, scene_deps)
		if _is_err(sub):
			return sub
		children.append(sub)
	return {"expr": expr, "name": node["name"], "cls": node["cls"], "children": children}


static func find_gd_files(dir):
	var out = []
	var da = DirAccess.open(dir)
	if da == null:
		return out
	da.list_dir_begin()
	var entry = da.get_next()
	while entry != "":
		var p = _norm_abs(dir + "/" + entry)
		if da.current_is_dir():
			for sub in find_gd_files(p):
				out.append(sub)
		elif entry.ends_with(".gd"):
			out.append(p)
		entry = da.get_next()
	da.list_dir_end()
	return out


static func _collect_dep(l, candidate, from_res, res_root, closure_only, weak, queue) -> Variant:
	if candidate == null:
		return null
	if not String(candidate).ends_with(".gd"):
		return null
	if closure_only and _climbs_above_root(candidate, l["absPath"], res_root):
		return _err("closure-root", "\"" + candidate + "\" 往上爬出了闭包根（默认是入口所在目录）：res:// 空间放不下 .. —— 用 --res-root 点名真正的根，或把父脚本挪进入口那一层")
	var dep_res = resolve_gd_path(from_res, candidate)
	if not l["depPaths"].has(dep_res):
		l["depPaths"][dep_res] = true
		queue.append(dep_res)
	if weak != true:
		l["strongDeps"][dep_res] = true
	return dep_res


static func compile_project(opts) -> Variant:
	var res_root = _norm_abs(opts["resRoot"])
	var entries = []
	for e in opts["entries"]:
		entries.append(_resolve(e, ""))
	var loaded = {}
	var diags = []
	var queue = []
	var seed_paths = {}

	var need = func need(abs_path):
		var res_path = normalize_res(_to_res_path(abs_path, res_root))
		if loaded.has(res_path):
			return loaded[res_path]
		if not _file_exists(abs_path):
			return _err("missing-file", "找不到脚本文件：" + res_path + "（" + abs_path + "）")
		var src = _read_text(abs_path)
		var m = LO.lower(SR.parse_source(src))
		if m == null:
			var le = LO.last_error
			if le == null:
				return _err("syntax", "语法畸形未支持：lower 没有给出错误")
			return le
		var js_name = m.get("className")
		if js_name == null:
			js_name = _module_class_name(m, res_path)
		var l = {
			"resPath": res_path,
			"absPath": abs_path,
			"module": m,
			"depPaths": {},
			"strongDeps": {},
			"classRefs": {},
			"jsName": js_name,
		}
		loaded[res_path] = l
		return l

	var closure_only = opts.get("closureOnly") == true
	for e2 in entries:
		var seeded = normalize_res(_to_res_path(e2, res_root))
		if not seed_paths.has(seeded):
			seed_paths[seeded] = true
			queue.append(seeded)
	if not closure_only:
		for f in find_gd_files(res_root):
			var seeded2 = normalize_res(_to_res_path(f, res_root))
			if not seed_paths.has(seeded2):
				seed_paths[seeded2] = true
				queue.append(seeded2)
	var i = 0
	while i < queue.size():
		var res_path2 = queue[i]
		i += 1
		var abs = _res_to_abs(res_path2, res_root)
		var l2 = need.call(abs)
		if _is_err(l2):
			return l2
		var ext = _extends_ref_text(l2["module"].get("extends"))
		var dep = _collect_dep(l2, ext, res_path2, res_root, closure_only, false, queue)
		if _is_err(dep):
			return dep
		var exprs = []
		walk_module_exprs(l2["module"], exprs)
		for ex in exprs:
			if ex.get("kind") != "call" or ex["callee"].get("kind") != "ident":
				continue
			var fn = ex["callee"]["name"]
			if fn != "preload" and fn != "load":
				continue
			if ex["args"].is_empty():
				continue
			var a = ex["args"][0]
			if a.get("kind") != "lit" or a.get("lit") != "string":
				continue
			var dep2 = _collect_dep(l2, String(a["value"]), res_path2, res_root, closure_only, fn == "load", queue)
			if _is_err(dep2):
				return dep2

	var class_index = {}
	for l3 in loaded.values():
		var cn = l3["module"].get("className")
		if cn != null:
			var prev = class_index.get(cn)
			if prev != null and prev != l3["resPath"]:
				return _err("duplicate-class-name", "class_name \"" + cn + "\" 同时出现在 " + prev + " 和 " + l3["resPath"])
			class_index[cn] = l3["resPath"]

	var entry_res_set = {}
	for e3 in entries:
		entry_res_set[normalize_res(_to_res_path(e3, res_root))] = true
	for l4 in loaded.values():
		var own = l4["module"].get("className")
		var locals = {}
		for v in l4["module"]["vars"]:
			locals[v["name"]] = true
		for f2 in l4["module"]["funcs"]:
			locals[f2["name"]] = true
		for s in l4["module"]["signals"]:
			locals[s["name"]] = true
		for n in _local_names(l4["module"]):
			locals[n] = true
		var candidates = []
		var ext_text = _extends_ref_text(l4["module"].get("extends"))
		if ext_text != null and not ext_text.ends_with(".gd"):
			candidates.append(_bare_ext(ext_text))
		var exprs2 = []
		walk_module_exprs(l4["module"], exprs2)
		for e in exprs2:
			if e.get("kind") == "ident":
				candidates.append(e["name"])
			if e.get("kind") == "attribute" and e.get("name") == "new" and e["obj"].get("kind") == "ident":
				candidates.append(e["obj"]["name"])
			if e.get("kind") == "is" or e.get("kind") == "as":
				candidates.append(_type_ref_name(e.get("type")))
		for name in candidates:
			if name == null or name == own or locals.has(name):
				continue
			if class_index.has(name):
				l4["classRefs"][name] = true

	var cyc = _detect_cycles(loaded, res_root)
	if cyc != null:
		return cyc

	var attr_names = {}
	for l5 in loaded.values():
		var exprs3 = []
		walk_module_exprs(l5["module"], exprs3)
		for e2 in exprs3:
			if e2.get("kind") == "attribute":
				attr_names[e2["name"]] = true
			if e2.get("kind") == "lit" and e2.get("lit") == "string":
				attr_names[_js_string(e2["value"])] = true
	var raw_abi_blocked = {}
	var extended_modules = {}
	for l6 in loaded.values():
		var bm = _base_module(l6, loaded, class_index)
		if bm != null:
			raw_abi_blocked[l6["resPath"]] = true
			raw_abi_blocked[bm["resPath"]] = true
			extended_modules[bm["resPath"]] = true

	var scene_path = opts["sceneFile"] if opts.has("sceneFile") else main_scene_file(opts["resRoot"])
	var config_name = project_config_name(res_root)
	var scene_root = null
	var scene_deps = {}
	if scene_path != null:
		scene_root = SC.parse_scene(_read_text(scene_path))
		if scene_root is Dictionary and scene_root.has("__error"):
			return scene_root
		var stack = [scene_root]
		while stack.size() > 0:
			var node = stack.pop_back()
			if node.get("script") != null:
				var dep3 = loaded.get(normalize_res(node["script"]))
				if dep3 == null:
					return _err("scene-script-missing", "场景脚本 " + node["script"] + " 不在编译作用域里")
				scene_deps[normalize_res(node["script"])] = dep3
			for ch in node["children"]:
				stack.append(ch)
		if scene_root.get("script") == null:
			return _err("scene-root-script", "场景根节点没挂脚本时入口驱动发不出来（只量过根节点带 script= 的那一形）")

	var preload_consts = _consts_by_class(loaded)
	var preload_classes = _inner_classes_by_class(loaded)
	var preloaded_paths = _preloaded_res_paths(loaded)

	var modules = []
	for l7 in loaded.values():
		var inherited = _inherited_members(l7, loaded, class_index)
		var globals = {}
		for n2 in class_index.keys():
			globals[n2] = true
		for n3 in inherited:
			globals[n3] = true
		var host_chain = opts.get("hostImport") != null and _host_on_chain(l7, loaded, class_index, entry_res_set)
		var an = AZ.analyze(l7["module"], globals, l7["resPath"], host_chain)
		if an["diagnostics"].size() > 0:
			for d in an["diagnostics"]:
				diags.append({"resPath": l7["resPath"], "diagnostic": d})
			continue

		var is_entry = entry_res_set.has(l7["resPath"])
		var base = _resolve_base(l7, loaded, class_index, res_root, opts)
		if _is_err(base):
			return base
		var base_name = null
		if base != null:
			base_name = base["jsName"]
		var class_refs = []
		for name2 in l7["classRefs"].keys():
			var depfile = _class_file(name2, loaded, class_index)
			if depfile == null:
				continue
			if base_name != null and depfile["jsName"] == base_name:
				continue
			class_refs.append({"name": depfile["jsName"], "from": _js_import_specifier(l7, depfile, opts)})

		var preloads = []
		var load_map = {}
		var side_effect = {}
		var exprs4 = []
		walk_module_exprs(l7["module"], exprs4)
		for e3 in exprs4:
			if e3.get("kind") != "call" or e3["callee"].get("kind") != "ident":
				continue
			var fn2 = e3["callee"]["name"]
			if fn2 != "preload" and fn2 != "load":
				continue
			if e3["args"].is_empty():
				continue
			var a2 = e3["args"][0]
			if a2.get("kind") != "lit" or a2.get("lit") != "string":
				continue
			var literal = String(a2["value"])
			var dep_res = resolve_gd_path(l7["resPath"], literal)
			var dep4 = loaded.get(dep_res)
			if dep4 == null:
				continue
			if fn2 == "preload":
				var seen = false
				for p in preloads:
					if p["literal"] == literal:
						seen = true
				if not seen:
					preloads.append({"literal": literal, "name": dep4["jsName"], "from": _js_import_specifier(l7, dep4, opts)})
			else:
				load_map[literal] = dep_res
				side_effect[dep_res] = _js_import_specifier(l7, dep4, opts)

		var scene = null
		if scene_root != null and normalize_res("" if scene_root.get("script") == null else scene_root["script"]) == l7["resPath"]:
			var kids = []
			for ch2 in scene_root["children"]:
				var kid = _scene_child(ch2, scene_deps)
				if _is_err(kid):
					return kid
				kids.append(kid)
			scene = {"rootName": scene_root["name"], "rootCls": scene_root["cls"], "children": kids}
		if scene != null:
			for dep5 in scene_deps.values():
				if dep5["resPath"] == l7["resPath"]:
					continue
				var dup = false
				for r in class_refs:
					if r["name"] == dep5["jsName"]:
						dup = true
				if not dup:
					class_refs.append({"name": dep5["jsName"], "from": _js_import_specifier(l7, dep5, opts)})

		var js_path = _js_path_for(l7, opts)
		var emit_opts = {
			"runtimeImport": _rel_from_js(js_path, _resolve(opts.get("runtimeFile") if opts.get("runtimeFile") != null else "runtime/index", opts["runtimeRoot"])) if opts.get("runtimeRoot") != null else opts["runtimeImport"],
			"hostImport": null,
			"autoRun": is_entry if opts.get("autoRun") == null else opts["autoRun"],
			"className": l7["jsName"],
			"hostBaseInChain": host_chain,
			"classRefs": class_refs,
			"resPath": l7["resPath"],
			"preloads": preloads,
			"preloadConsts": preload_consts,
			"preloadClasses": preload_classes,
			"exportInner": preloaded_paths.has(l7["resPath"]),
			"inheritedMembers": inherited,
			"loadMap": _load_map_rows(load_map),
			"sideEffectImports": side_effect.values(),
			"rawAbiExternal": _raw_abi_names(l7, raw_abi_blocked, attr_names),
			"extendedByScript": extended_modules.has(l7["resPath"]),
			"runtimeMode": "import" if opts.get("runtimeMode") == null else opts["runtimeMode"],
			"sourcemap": opts.get("sourcemap"),
			"jsFile": _basename(js_path),
			"sourceFile": _relative(_dirname(js_path), _norm_abs(res_root + "/" + l7["resPath"].substr(RES_PREFIX.length()))),
		}
		if opts.get("hostImport") != null:
			emit_opts["hostImport"] = _rel_from_js(js_path, _resolve(opts.get("hostFile") if opts.get("hostFile") != null else "host", opts["runtimeRoot"])) if opts.get("runtimeRoot") != null else opts["hostImport"]
		if base != null:
			emit_opts["baseClass"] = base["spec"]
		elif is_entry and opts.get("hostImport") != null:
			emit_opts["baseClass"] = {"kind": "host"}
		else:
			emit_opts["baseClass"] = {"kind": "none"}
		if scene != null:
			emit_opts["scene"] = scene
		if is_entry and config_name != null:
			emit_opts["projectName"] = config_name
		if opts.get("standaloneInline") != null:
			emit_opts["standaloneInline"] = opts["standaloneInline"]
		if opts.get("runtimeMode") == "local" and opts.get("standaloneFile") != null:
			emit_opts["standaloneRequirePath"] = "./" + _relative(_dirname(js_path), opts["standaloneFile"])

		var emitted = null
		if opts.get("sourcemap") == true:
			emitted = ME.emit_module_with_map(l7["module"], emit_opts, an)
		else:
			var code = ME.emit_module(l7["module"], emit_opts, an)
			if code is Dictionary:
				return code
			emitted = {"code": code, "map": null}
		if emitted is Dictionary and emitted.has("__error"):
			return emitted
		var mod = {
			"resPath": l7["resPath"],
			"jsPath": js_path,
			"className": l7["jsName"],
			"code": emitted["code"],
			"usesPackCodec": l7["module"].get("usesPackCodec"),
		}
		if emitted.get("map") != null:
			mod["map"] = emitted["map"]
		modules.append(mod)

	return {"modules": modules, "diags": diags}


static func _js_string(v):
	if v == null:
		return "null"
	var t = typeof(v)
	if t == TYPE_STRING:
		return v
	if t == TYPE_STRING_NAME:
		return String(v)
	if t == TYPE_INT:
		return str(v)
	if t == TYPE_FLOAT:
		return load("res://numfmt.gd").js_num_text(v)
	if t == TYPE_BOOL:
		return "true" if v else "false"
	if t == TYPE_ARRAY:
		var parts = []
		for it in v:
			parts.append(_js_string(it))
		return ",".join(parts)
	return "[object Object]"


static func _load_map_rows(load_map):
	var out = []
	for k in load_map.keys():
		out.append({"literal": k, "resPath": load_map[k]})
	return out


static func _raw_abi_names(l, raw_abi_blocked, attr_names):
	if raw_abi_blocked.has(l["resPath"]):
		var names = []
		for f in l["module"]["funcs"]:
			names.append(f["name"])
		return names
	var out = []
	for k in attr_names.keys():
		out.append(k)
	return out
