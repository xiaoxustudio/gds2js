const T = preload("res://arity_tables.gd")
const FC = preload("res://faces.gd")
const WK = preload("res://walk.gd")
const SL = preload("res://slots.gd")
const AR = preload("res://arity.gd")
const AS = preload("res://analyze_state.gd")


static func _bodies(m):
	var out = []
	for f in m["funcs"]:
		out.append(f["body"])
	_collect_bodies(m["innerClasses"], out)
	return out


static func _collect_bodies(list, out):
	for c in list:
		for f in c["funcs"]:
			out.append(f["body"])
		_collect_bodies(c["innerClasses"], out)


static func _strip_type(name):
	var open = name.find("[")
	return name if open < 0 else name.substr(0, open)


static func check_pack_is_as(m, diags):
	for body in _bodies(m):
		var sn_vars = {}
		FC.string_name_vars(body, sn_vars)
		var found = []
		WK.walk_expr_kinds(body, found)
		for node in found:
			if node["type"].get("kind") != "named":
				continue
			var target = _strip_type(node["type"]["name"])
			var pack_target = T.PACK_IS_AS_NAMES.has(target)
			var operand = node["operand"]
			var sn_var_operand = operand.get("kind") == "ident" and sn_vars.has(operand.get("name"))
			var sn_against = target == "String" and node.get("kind") == "is" and (sn_var_operand or FC.static_type_name(operand) == "StringName")
			if not pack_target and not sn_against:
				continue
			var from = FC.static_type_name(operand)
			if sn_var_operand and not pack_target:
				from = "StringName"
			if from == null:
				continue
			if node.get("kind") == "is":
				diags.append({"code": "pack-is-type", "message": "Expression is of type \"" + from + "\" so it can't be of type \"" + target + "\".", "loc": node["loc"]})
			else:
				diags.append({"code": "pack-as-type", "message": "Cannot cast a value of type \"" + from + "\" as \"" + target + "\".", "loc": node["loc"]})
				diags.append({"code": "pack-as-type", "message": "Invalid cast. Cannot convert from \"" + from + "\" to \"" + target + "\".", "loc": node["loc"]})


static func _owner_face(obj, packs, annot, base):
	if obj.get("kind") == "lit":
		return "String" if obj.get("lit") == "string" else null
	if obj.get("kind") == "ident" and obj.get("name") != null:
		var name = obj["name"]
		if packs.has(name):
			return packs[name]
		if annot.has(name):
			return annot[name]
		return base.get(name)
	if obj.get("kind") == "call":
		var callee = obj["callee"]
		var owner = null
		if callee.get("kind") == "attribute":
			owner = _owner_face(callee["obj"], packs, annot, base)
		return FC.chain_recv_face(obj, owner)
	return null


static func check_pack_arg_slots(m, diags):
	for scope in SL.pack_arg_scopes(m):
		var nodes = scope["nodes"]
		var base = scope["base"]
		var packs = {}
		var annot = {}
		for name in base.keys():
			var ty = base[name]
			if T.PACK_ARG_SLOTS.has(ty):
				packs[name] = ty
			elif T.ANNOT_SOURCES.has(ty):
				annot[name] = ty
		var reassigned = WK.reassigned_names(nodes)
		for n in nodes:
			if n.get("kind") != "var" or n.get("name") == null or reassigned.has(n["name"]):
				continue
			var type = n.get("type")
			if type != null and type.get("kind") == "named" and T.PACK_ARG_SLOTS.has(type["name"]):
				packs[n["name"]] = type["name"]
				continue
			if type != null and type.get("kind") == "named" and T.ANNOT_SOURCES.has(type["name"]):
				annot[n["name"]] = type["name"]
			var init = n.get("init")
			if init != null and init.get("kind") == "call" and init["callee"].get("kind") == "ident" and T.PACK_ARG_SLOTS.has(init["callee"]["name"]):
				packs[n["name"]] = init["callee"]["name"]
		var ann_all = base.duplicate()
		for n in nodes:
			if n.get("kind") != "var" or n.get("name") == null or reassigned.has(n["name"]):
				continue
			var t2 = n.get("type")
			if t2 != null and t2.get("kind") == "named":
				ann_all[n["name"]] = t2["name"]
		for n in nodes:
			if n.get("kind") != "call":
				continue
			var callee = n.get("callee")
			if callee == null or callee.get("kind") != "attribute":
				continue
			var obj = callee.get("obj")
			if obj == null:
				continue
			var inline = null
			if obj.get("kind") == "call":
				var oc = obj.get("callee")
				if oc != null and oc.get("kind") == "ident" and oc.get("name") != null and T.PACK_ARG_SLOTS.has(oc["name"]):
					inline = oc["name"]
			var via_chain = null
			if obj.get("kind") == "call":
				via_chain = FC.chain_recv_face(obj, _owner_face(obj["callee"]["obj"], packs, annot, base) if obj["callee"].get("kind") == "attribute" else null)
			var pack = null
			if obj.get("kind") == "ident" and obj.get("name") != null:
				if packs.has(obj["name"]):
					pack = packs[obj["name"]]
				elif T.PACK_ARG_SLOTS.has(obj["name"]):
					pack = obj["name"]
			else:
				pack = inline
				if pack == null and via_chain != null and T.PACK_TYPE_NAMES.has(via_chain):
					pack = via_chain
			if pack == null:
				continue
			var method = callee.get("name")
			if method == null:
				continue
			if not T.PACK_ARG_POSITIONS.has(method):
				continue
			var slots = T.PACK_ARG_POSITIONS[method]
			var args = n.get("args", [])
			var face = T.PACK_ARG_SLOTS[pack]
			var limit = slots.size() if slots.size() < args.size() else args.size()
			for p in limit:
				var arg0 = args[p]
				var src = SL.pack_arg_source(arg0)
				var annotated = null
				if src == null:
					annotated = SL.named_slot_source(arg0, ann_all)
				var proven = src if src != null else annotated
				var kind = slots[p]
				if kind == "a":
					var named_a = null
					if arg0.get("kind") == "ident":
						named_a = SL.named_append_source(arg0["name"], ann_all)
					var src_a = src if src != null else named_a
					if src_a != null and (src_a == "null" or SL.object_arg_known(src_a)) and not SL.value_arg_wants(pack):
						continue
					var base_a = "" if src_a == null else FC.arg_face_base(src_a)
					if src_a == null or base_a == "Array" or base_a == pack:
						continue
					var two = T.PACK_APPEND_ARRAY_AS.has(base_a)
					if not two and not (base_a == "Dictionary" or T.PACK_TYPE_NAMES.has(base_a)):
						continue
					var aloc = n.get("loc")
					if two and named_a == null:
						diags.append({"code": "pack-arg-slot", "message": "Cannot pass a value of type \"" + src_a + "\" as \"" + pack + "\".", "loc": aloc})
					diags.append({"code": "pack-arg-slot", "message": "Invalid argument for \"" + method + "()\" function: argument " + str(p + 1) + " should be \"" + pack + "\" but is \"" + src_a + "\".", "loc": aloc})
					continue
				if proven == null:
					continue
				var slot = face["slot"]
				var ok = face["ok"]
				if kind == "i":
					slot = "int"
					ok = T.PACK_INT_SLOT_OK
				elif kind == "b":
					slot = "bool"
					ok = T.PACK_BOOL_SLOT_OK
				if ok.has(proven):
					continue
				if SL.object_arg_known(proven) and not SL.value_arg_wants(slot):
					continue
				var loc = n.get("loc")
				if src != null and proven != "Array" and proven != "Dictionary" and not T.PACK_TYPE_NAMES.has(proven):
					diags.append({"code": "pack-arg-slot", "message": "Cannot pass a value of type \"" + proven + "\" as \"" + slot + "\".", "loc": loc})
				diags.append({"code": "pack-arg-slot", "message": "Invalid argument for \"" + method + "()\" function: argument " + str(p + 1) + " should be \"" + slot + "\" but is \"" + proven + "\".", "loc": loc})

static func _pk(node):
	var loc = node.get("loc")
	if loc == null:
		return "?"
	return str(loc["line"]) + ":" + str(loc["col"])


static func _pf_face_name(t):
	if t == null or t.get("kind") != "named":
		return null
	var n = t["name"]
	if T.PACK_TYPE_NAMES.has(n) or n == "Array" or n == "String" or n == "StringName" or n == "NodePath" or n == "int" or n == "float" or n == "bool":
		return n
	if T.VALUE_ARITY.has(n):
		return n
	return null


static func _pf_ann_text(text):
	if not text.begins_with("Array[") and not text.begins_with("Dictionary["):
		return null
	if not text.ends_with("]"):
		return null
	var open = text.find("[")
	var inner = text.substr(open + 1, text.length() - open - 2)
	if inner.contains("]"):
		return null
	var parts = []
	for p in inner.split(","):
		parts.append(p.strip_edges())
	return text.substr(0, open) + "[" + ", ".join(parts) + "]"


static func _pf_note_elem(elems, name, t):
	if t != null and t.get("kind") == "named" and FC.read_face_of(t["name"], null) != null:
		elems[name] = t["name"]


static func check_pack_face_names(m, diags):
	for scope in FC.attr_scopes(m):
		var nodes = scope["nodes"]
		var params = scope["params"]
		var ann = {}
		for n in nodes:
			if n.get("kind") != "var" or n.get("name") == null:
				continue
			var face = _pf_face_name(n.get("type"))
			if face != null:
				ann[n["name"]] = face
		var attr = ann.duplicate()
		for p in params:
			var face2 = _pf_face_name(p.get("type"))
			if face2 != null:
				attr[p["name"]] = face2
		var mods = {}
		for v in m["vars"]:
			var face3 = _pf_face_name(v.get("type"))
			if face3 != null:
				mods[v["name"]] = face3
		var elems = {}
		for v in m["vars"]:
			_pf_note_elem(elems, v["name"], v.get("type"))
		for n2 in nodes:
			if n2.get("kind") == "var" and n2.get("name") != null:
				_pf_note_elem(elems, n2["name"], n2.get("type"))
		for prm in params:
			_pf_note_elem(elems, prm["name"], prm.get("type"))
		var call_callees = {}
		var write_targets = {}
		for n3 in nodes:
			if n3.get("kind") == "call":
				call_callees[_pk(n3["callee"])] = true
			if n3.get("kind") == "assign" and n3["target"].get("kind") == "attribute":
				write_targets[_pk(n3["target"])] = true
		for n in nodes:
			if n.get("kind") == "call":
				var callee = n["callee"]
				if callee.get("kind") != "attribute":
					continue
				var kind = FC.pack_face_recv(callee["obj"], attr)
				if kind == null or not T.PACK_TYPE_NAMES.has(kind):
					var recv_obj = callee["obj"]
					var chain_recv = recv_obj.get("kind") == "call" and recv_obj["callee"].get("kind") == "attribute"
					var vface = FC.attr_face_recv(recv_obj, attr, elems, mods)
					if vface == null or (not AR.instance_face_managed(vface) and not T.PACK_TYPE_NAMES.has(vface) and vface != "StringName" and vface != "NodePath"):
						continue
					if vface == "String" and recv_obj.get("kind") != "index" and not chain_recv:
						continue
					var vmethod = callee.get("name")
					if vmethod == null:
						continue
					var vtbl = T.VALUE_ARITY.get(vface)
					if (vtbl != null and vtbl.has(vmethod)) or not AR.member_name_absent(vface, vmethod):
						continue
					var vloc = n.get("loc")
					diags.append({"code": "face-member-missing", "message": "Cannot find member \"" + vmethod + "\" in base \"" + vface + "\".", "loc": vloc})
					diags.append({"code": "face-member-not-found", "message": "Function \"" + vmethod + "()\" not found in base " + vface + ".", "loc": vloc})
					continue
				var method = callee.get("name")
				var tbl2 = T.VALUE_ARITY.get(kind)
				if method == null or (tbl2 != null and tbl2.has(method)):
					continue
				if not AR.member_name_absent(kind, method):
					continue
				var loc0 = n.get("loc")
				diags.append({"code": "face-member-missing", "message": "Cannot find member \"" + method + "\" in base \"" + kind + "\".", "loc": loc0})
				diags.append({"code": "face-member-not-found", "message": "Function \"" + method + "()\" not found in base " + kind + ".", "loc": loc0})
				continue
			if n.get("kind") != "attribute" or call_callees.has(_pk(n)):
				continue
			var face4 = FC.attr_face_recv(n["obj"], attr, elems, mods)
			var name = n.get("name")
			if name == null:
				continue
			var loc = n.get("loc")
			if face4 == null:
				var rec = n["obj"]
				if name == "new" and rec.get("kind") == "ident" and rec.get("name") != null:
					var ann_text = elems.get(rec["name"])
					if ann_text == null:
						ann_text = attr.get(rec["name"])
					if ann_text == null:
						ann_text = ""
					var shown = _pf_ann_text(ann_text)
					if shown != null:
						var one = "Cannot find member \"new\" in base \"" + shown + "\"."
						diags.append({"code": "face-attr-missing", "message": one, "loc": loc})
						if ann_text.begins_with("Array"):
							diags.append({"code": "face-attr-missing", "message": one, "loc": loc})
				continue
			var table = null
			if face4 == "Array":
				table = T.ARRAY_ARITY
			elif face4 == "String":
				table = T.STRING_ARITY
			elif face4 == "StringName":
				table = T.STRING_NAME_ARITY
			elif face4 == "NodePath":
				table = T.NODE_PATH_ARITY
			else:
				var vt = T.VALUE_ARITY.get(face4)
				table = {} if vt == null else vt
			var refused = T.PACK_TYPE_NAMES.has(face4) or face4 == "Array" or face4 == "String"
			if table.has(name):
				if write_targets.has(_pk(n)):
					if refused:
						diags.append({"code": "face-attr-constant", "message": "Cannot assign a new value to a constant.", "loc": loc})
				else:
					var bounds = table[name]
					if loc != null and bounds != null:
						var r = AS.get_run()
						r["boundFaces"][AS.di_key(r, loc["line"], loc["col"])] = face4 + "," + str(bounds[0]) + "," + str(bounds[1])
				continue
			var absent = false
			if T.PACK_TYPE_NAMES.has(face4):
				absent = AR.member_name_absent(face4, name)
			elif face4 == "Array" or face4 == "String":
				absent = true
			else:
				absent = AR.value_attr_kind(face4, name) == "absent" or AR.instance_member_absent(face4, name) or ((face4 == "StringName" or face4 == "NodePath") and AR.member_name_absent(face4, name))
			if not absent:
				continue
			if not refused and write_targets.has(_pk(n)):
				continue
			var one2 = "Cannot find member \"" + name + "\" in base \"" + face4 + "\"."
			diags.append({"code": "face-attr-missing", "message": one2, "loc": loc})
			diags.append({"code": "face-attr-missing", "message": one2, "loc": loc})
