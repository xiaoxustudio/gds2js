const AS = preload("res://analyze_state.gd")
const GLOB = preload("res://globals.gd")
const IRF = preload("res://ir.gd")
const FC = preload("res://faces.gd")
const AR = preload("res://arity.gd")
const O = preload("res://op_tables.gd")
const T = preload("res://arity_tables.gd")


static func assign_target_name(t):
	if t == null or not (t is Dictionary):
		return null
	if t.get("kind") == "ident" and t.get("name") != null:
		return t["name"]
	if t.get("kind") == "attribute" and t.get("name") != null and t.get("obj") != null and t["obj"].get("name") == "self":
		return t["name"]
	return null


static func walk_expr_kinds(node, out):
	if node is Array:
		for x in node:
			walk_expr_kinds(x, out)
		return
	if not (node is Dictionary):
		return
	if node.get("kind") == "is" or node.get("kind") == "as":
		out.append(node)
	for k in node.keys():
		if k == "loc":
			continue
		walk_expr_kinds(node[k], out)


static func _flat_scan(n, nodes):
	if n is Array:
		for x in n:
			_flat_scan(x, nodes)
		return
	if not (n is Dictionary):
		return
	if n.get("kind") == "lambda":
		return
	nodes.append(n)
	for k in n.keys():
		if k != "loc":
			_flat_scan(n[k], nodes)


static func flatten_body(body):
	var nodes = []
	_flat_scan(body, nodes)
	return nodes


static func _collect_bodies(list, bodies):
	for c in list:
		for f in c["funcs"]:
			bodies.append(f["body"])
		_collect_bodies(c["innerClasses"], bodies)


static func flatten_bodies(m):
	var bodies = []
	for f in m["funcs"]:
		bodies.append(f["body"])
	_collect_bodies(m["innerClasses"], bodies)
	var out = []
	for b in bodies:
		out.append(flatten_body(b))
	return out


static func reassigned_names(nodes):
	var out = {}
	for n in nodes:
		if n.get("kind") != "assign":
			continue
		var target = n.get("target")
		if target != null and target.get("kind") == "ident" and target.get("name") != null:
			out[target["name"]] = true
	return out


static func module_assigned_names(m):
	var out = {}
	for nodes in flatten_bodies(m):
		for n in reassigned_names(nodes).keys():
			out[n] = true
	return out


static func _local_stmt(s, out):
	var kind = s.get("kind")
	if kind == "var":
		out[s["name"]] = true
		return
	if kind == "for":
		out[s["var"]] = true
		for x in s["body"]:
			_local_stmt(x, out)
		return
	if kind == "if":
		for br in s["branches"]:
			for x in br["body"]:
				_local_stmt(x, out)
		return
	if kind == "while":
		for x in s["body"]:
			_local_stmt(x, out)
		return
	if kind == "match":
		for arm in s["arms"]:
			if arm["pattern"].get("kind") == "bind":
				out[arm["pattern"]["name"]] = true
			for x in arm["body"]:
				_local_stmt(x, out)
		return


static func collect_local_names(body, params, out):
	for p in params:
		out[p] = true
	for s in body:
		_local_stmt(s, out)


static func class_table(m):
	var out = {}
	_class_table(m["innerClasses"], out)
	return out


static func _class_table(list, out):
	for c in list:
		if not out.has(c["name"]):
			out[c["name"]] = c
		_class_table(c["innerClasses"], out)


static func inherited_names(c, classes):
	var seen = {c["name"]: true}
	var out = []
	var next = c.get("extends")
	while next != null:
		if not classes.has(next):
			break
		var parent = classes[next]
		if seen.has(parent["name"]):
			break
		seen[parent["name"]] = true
		for n in AS.decl_names(parent):
			out.append(n)
		next = parent.get("extends")
	return out


static func guaranteed_return(stmts):
	if stmts.is_empty():
		return false
	var last = stmts[stmts.size() - 1]
	if last.get("kind") == "return":
		return last.get("value") != null
	if last.get("kind") == "if":
		if last["branches"].is_empty():
			return false
		var tail = last["branches"][last["branches"].size() - 1]
		if tail.get("cond") != null:
			return false
		for b in last["branches"]:
			if not guaranteed_return(b["body"]):
				return false
		return true
	if last.get("kind") == "match":
		for a in last["arms"]:
			if a["pattern"].get("kind") == "wildcard" and guaranteed_return(a["body"]):
				return true
		return false
	return false


static func pattern_bindings(p):
	var kind = p.get("kind")
	if kind == "bind":
		return [p["name"]]
	if kind == "array":
		var out = []
		for it in p["items"]:
			for n in pattern_bindings(it):
				out.append(n)
		return out
	if kind == "dict":
		var out = []
		for e in p["entries"]:
			for n in pattern_bindings(e["pattern"]):
				out.append(n)
		return out
	return []


static func collect_reads(node, bound, out):
	if node is Array:
		for v in node:
			collect_reads(v, bound, out)
		return
	if not (node is Dictionary):
		return
	if node.get("kind") == "ident" and node.get("name") != null and not bound.has(node["name"]):
		out[node["name"]] = true
	for k in node.keys():
		collect_reads(node[k], bound, out)

static func _seed_class_names(out, list):
	for c in list:
		for v in c["vars"]:
			out[v["name"]] = true
		for f in c["funcs"]:
			out[f["name"]] = true
		for sg in c["signals"]:
			out[sg["name"]] = true
		var consts = c.get("consts")
		if consts != null:
			for k in consts:
				out[k["name"]] = true
		_seed_class_names(out, c["innerClasses"])


static func seed_outer_names(m):
	var out = {}
	for name in AS.decl_names(m):
		out[name] = true
	_seed_class_names(out, m["innerClasses"])
	AS.get_run()["outerNames"] = out


static func record_captures(e, scope):
	if e.get("kind") != "lambda" or e.get("loc") == null:
		return
	var bound = {}
	var params = []
	for p in e["params"]:
		params.append(p["name"])
	collect_local_names(e["body"], params, bound)
	for p in e["params"]:
		bound[p["name"]] = true
	var reads = {}
	collect_reads(e, bound, reads)
	var r = AS.get_run()
	var caps = []
	for n in reads.keys():
		if n == "self":
			continue
		if r["outerNames"].has(n):
			continue
		if not scope.has_local(n):
			continue
		caps.append(n)
	caps.sort()
	if caps.size() > 0:
		r["lambdaCaptures"][AS.cap_key(r, e["loc"]["line"], e["loc"]["col"])] = caps

static func _cfr_key(loc):
	return str(loc["line"]) + ":" + str(loc["col"])


static func mark_class_face_receivers(m):
	for nodes in flatten_bodies(m):
		for n in nodes:
			if n.get("kind") != "attribute":
				continue
			var obj = n.get("obj")
			if obj == null or obj.get("kind") != "ident" or obj.get("name") == null:
				continue
			if AR.class_face_arity(obj["name"]) != null:
				AS.get_run()["classFaceReceivers"][_cfr_key(obj["loc"])] = true


static func check_func(f, outer, coroutines, diags, host_face = null, engine_face = null):
	if host_face == null:
		host_face = {}
	if engine_face == null:
		engine_face = {}
	var names = ["self"]
	for p in f["params"]:
		names.append(p["name"])
	var scope = outer.func_child(names, f.get("isStatic") != true)
	var r = AS.get_run()
	var prev_face = r["hostValueMethods"]
	var prev_engine = r["enginePropFace"]
	var prev_ctx = r["hostStaticCtx"]
	r["hostValueMethods"] = host_face
	r["enginePropFace"] = engine_face
	if f.get("isStatic") == true:
		r["hostStaticCtx"] = {"kind": "func", "name": f["name"]}
	else:
		r["hostStaticCtx"] = null
	for p in f["params"]:
		if p.get("default") != null:
			walk_expr(p["default"], scope, coroutines, diags)
	walk_stmts(f["body"], scope, coroutines, diags, false)
	r["hostValueMethods"] = prev_face
	r["enginePropFace"] = prev_engine
	r["hostStaticCtx"] = prev_ctx


static func _we_ident(e, scope, diags):
	if e["name"] == "super":
		return
	var r = AS.get_run()
	var static_ctx = r["hostStaticCtx"]
	if e["name"] == "self":
		if static_ctx != null and static_ctx.get("kind") == "const":
			diags.append({"code": "const-not-constant", "message": "Assigned value for constant \"" + static_ctx["name"] + "\" isn't a constant expression.", "loc": e["loc"]})
		elif not scope.allows_self():
			diags.append({"code": "self-in-static", "message": "Cannot use \"self\" inside a static function.", "loc": e["loc"]})
		return
	if scope.has(e["name"]) or GLOB.is_global_const(e["name"]):
		return
	if r["classFaceReceivers"].has(_cfr_key(e["loc"])):
		return
	var key = AS.gv_key(r, e["name"], e["loc"]["line"], e["loc"]["col"])
	if GLOB.is_global_value(e["name"]):
		r["globalValueReads"][key] = true
	elif GLOB.is_engine_class(e["name"]):
		r["nativeClassReads"][key] = true
	elif r["hostValueMethods"].has(e["name"]):
		if static_ctx == null:
			r["hostMethodReads"][key] = true
		elif static_ctx.get("kind") == "func":
			diags.append({"code": "host-read-in-static", "message": "Cannot access non-static variable \"" + e["name"] + "\" from the static function \"" + static_ctx["name"] + "()\".", "loc": e["loc"]})
		elif static_ctx.get("kind") == "var":
			diags.append({"code": "host-read-in-static", "message": "Cannot access non-static variable \"" + e["name"] + "\" from a static variable initializer.", "loc": e["loc"]})
		else:
			diags.append({"code": "const-not-constant", "message": "Assigned value for constant \"" + static_ctx["name"] + "\" isn't a constant expression.", "loc": e["loc"]})
	elif r["enginePropFace"].has(e["name"]) and static_ctx == null:
		r["enginePropReads"][key] = true
	elif GLOB.is_virtual_host(e["name"]):
		diags.append({"code": "undeclared-identifier", "message": "Identifier not found: " + e["name"], "loc": e["loc"]})
	elif GLOB.is_builtin_type_name(e["name"]):
		diags.append({"code": "undeclared-identifier", "message": "Builtin type cannot be used as a name on its own.", "loc": e["loc"]})
		diags.append({"code": "undeclared-identifier", "message": "Identifier \"" + e["name"] + "\" not declared in the current scope.", "loc": e["loc"]})
	else:
		diags.append({"code": "undeclared-identifier", "message": "Identifier \"" + e["name"] + "\" not declared in the current scope.", "loc": e["loc"]})


static func walk_expr(e, scope, coroutines, diags, awaited = false):
	var kind = e.get("kind")
	if kind == "lit":
		return
	if kind == "ident":
		_we_ident(e, scope, diags)
		return
	if kind == "unary":
		walk_expr(e["operand"], scope, coroutines, diags)
		return
	if kind == "await":
		walk_expr(e["operand"], scope, coroutines, diags, true)
		return
	if kind == "binary":
		load("res://operators.gd").check_operator(e, diags)
		walk_expr(e["left"], scope, coroutines, diags)
		walk_expr(e["right"], scope, coroutines, diags)
		return
	if kind == "is" or kind == "as":
		walk_expr(e["operand"], scope, coroutines, diags)
		return
	if kind == "index":
		walk_expr(e["obj"], scope, coroutines, diags)
		walk_expr(e["index"], scope, coroutines, diags)
		return
	if kind == "attribute":
		var fn = IRF.static_member_fn(e["obj"])
		var is_pack = e["obj"].get("kind") == "ident" and T.PACK_TYPE_NAMES.has(e["obj"]["name"])
		if fn == null and not is_pack:
			walk_expr(e["obj"], scope, coroutines, diags)
		return
	if kind == "array":
		for it in e["items"]:
			walk_expr(it, scope, coroutines, diags)
		return
	if kind == "dict":
		for en in e["entries"]:
			walk_expr(en["key"], scope, coroutines, diags)
			walk_expr(en["value"], scope, coroutines, diags)
		return
	if kind == "lambda":
		var pnames = []
		for p in e["params"]:
			pnames.append(p["name"])
		var fn_scope = scope.child(pnames)
		record_captures(e, scope)
		var def_scope = scope
		for p in e["params"]:
			if p.get("default") != null:
				walk_expr(p["default"], def_scope, coroutines, diags)
			def_scope = def_scope.child([p["name"]])
		walk_stmts(e["body"], fn_scope, coroutines, diags, false)
		return
	if kind == "call":
		var CA = load("res://calls.gd")
		if e["callee"].get("kind") == "ident":
			var name = e["callee"]["name"]
			if coroutines.has(name) and not awaited:
				diags.append({"code": "coroutine-not-awaited", "message": "Function \"" + name + "()\" is a coroutine, so it must be called with \"await\".", "loc": e["loc"]})
			CA.check_call(name, e, diags)
			var arity = AR.builtin_arity(name, e["args"].size())
			if arity == null:
				arity = AR.utility_arity(name, e["args"].size())
			if arity != null:
				diags.append({"code": AR.builtin_arity_code(name), "message": arity, "loc": e["loc"]})
				var rows = O.GLOBAL_ARG_TYPES.get(name)
				if rows != null:
					for row in rows:
						var pos = row[0]
						if e["args"].size() >= pos and FC.literal_type_name(e["args"][pos - 1]) == "Array":
							diags.append({
								"code": "global-arg-type",
								"message": "Invalid argument for \"" + name + "()\" function: argument " + str(pos) + " should be \"" + row[1] + "\" but is \"Array\".",
								"loc": e["loc"],
							})
							break
		else:
			walk_expr(e["callee"], scope, coroutines, diags)
			if e["callee"].get("kind") == "attribute":
				CA.check_method_call(e["callee"]["name"], e, diags)
		for a in e["args"]:
			walk_expr(a, scope, coroutines, diags)
		return


static func walk_stmts(stmts, scope, coroutines, diags, in_loop):
	for s in stmts:
		walk_stmt(s, scope, coroutines, diags, in_loop)


static func _match_pattern_walk(p, scope, coroutines, diags):
	var kind = p.get("kind")
	if kind == "const":
		walk_expr(p["expr"], scope, coroutines, diags)
		return
	if kind == "array":
		for it in p["items"]:
			_match_pattern_walk(it, scope, coroutines, diags)
		return
	if kind == "dict":
		for en in p["entries"]:
			walk_expr(en["key"], scope, coroutines, diags)
			_match_pattern_walk(en["pattern"], scope, coroutines, diags)


static func walk_stmt(s, scope, coroutines, diags, in_loop):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("init") != null:
			walk_expr(s["init"], scope, coroutines, diags)
		scope.declare(s["name"])
		return
	if kind == "expr":
		walk_expr(s["expr"], scope, coroutines, diags, true)
		return
	if kind == "assign":
		walk_expr(s["target"], scope, coroutines, diags)
		walk_expr(s["value"], scope, coroutines, diags)
		return
	if kind == "return":
		if s.get("value") != null:
			walk_expr(s["value"], scope, coroutines, diags)
		return
	if kind == "if":
		for br in s["branches"]:
			if br.get("cond") != null:
				walk_expr(br["cond"], scope, coroutines, diags)
			walk_stmts(br["body"], scope.child([]), coroutines, diags, in_loop)
		return
	if kind == "for":
		walk_expr(s["iter"], scope, coroutines, diags)
		walk_stmts(s["body"], scope.child([s["var"]]), coroutines, diags, true)
		return
	if kind == "while":
		walk_expr(s["cond"], scope, coroutines, diags)
		walk_stmts(s["body"], scope.child([]), coroutines, diags, true)
		return
	if kind == "match":
		walk_expr(s["subject"], scope, coroutines, diags)
		for arm in s["arms"]:
			_match_pattern_walk(arm["pattern"], scope, coroutines, diags)
			var arm_scope = scope.child(pattern_bindings(arm["pattern"]))
			if arm.get("guard") != null:
				walk_expr(arm["guard"], arm_scope, coroutines, diags)
			walk_stmts(arm["body"], arm_scope, coroutines, diags, in_loop)
		return
	if kind == "break" or kind == "continue":
		if not in_loop:
			diags.append({"code": "break-outside-loop", "message": kind + " 不在循环内", "loc": s["loc"]})
		return
