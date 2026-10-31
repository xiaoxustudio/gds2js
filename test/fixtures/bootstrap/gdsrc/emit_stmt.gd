const CTX = preload("res://context.gd")
const EB = preload("res://expr_boxed.gd")
const HE = preload("res://helpers.gd")
const AB = preload("res://abi.gd")
const FN = preload("res://func.gd")
const LAY = preload("res://layout.gd")
const AZ = preload("res://analyze_idx.gd")

static var failed = false
static var last_error = null


static func err(code, message):
	failed = true
	last_error = {"__error": code, "message": message}
	return []


static func cond_expr(e):
	var r = EB.emit_expr_r(e)
	if r.get("__error") != null:
		return err(r["__error"], r["message"])
	if r["rep"] == "bool":
		return r["code"]
	if r["rep"] == "int" or r["rep"] == "float":
		return r["code"] + " !== 0"
	if r["rep"] == "str":
		return r["code"] + " !== \"\""
	return "rt.ops.truthy(" + r["code"] + ")"


static func _an_engine_prop(e):
	if CTX.get_analysis() == null:
		return false
	return AZ.is_engine_prop_read(CTX.get_analysis(), e)


static func emit_stmt(s, void_return):
	var out = []
	for l in FN.frame_stmt_lines(s.get("loc")):
		out.append(l)
	for l in emit_stmt_inner(s, void_return):
		out.append(l)
	return out


static func emit_stmt_inner(s, void_return):
	var kind = s.get("kind")
	if kind == "var":
		var ek = CTX.ctx["RAW_ARRAYS"].get(s["name"])
		if ek != null and s.get("init") != null and s["init"].get("kind") == "array":
			if AB.is_grid_elem(ek):
				var leaf = AB.leaf_of(ek)
				var rows = []
				for row in s["init"]["items"]:
					if row.get("kind") != "array":
						return err("raw-array-init", "内部不变量破坏：裸网格行期望数组字面量，实得 " + str(row.get("kind")))
					var cells = []
					for it in row["items"]:
						var r = EB.emit_expr_r(it)
						if r.get("__error") != null:
							return err(r["__error"], r["message"])
						if r["rep"] != leaf:
							return err("raw-array-init", "内部不变量破坏：裸网格叶子期望 " + leaf + "，实得 " + r["rep"])
						cells.append(r["code"])
					rows.append("[" + ", ".join(cells) + "]")
				return ["let " + s["name"] + ": " + AB.raw_elem_ts(ek) + "[][] = [" + ", ".join(rows) + "];"]
			var parts = []
			for it in s["init"]["items"]:
				var r2 = EB.emit_expr_r(it)
				if r2.get("__error") != null:
					return err(r2["__error"], r2["message"])
				if r2["rep"] != ek:
					return err("raw-array-init", "内部不变量破坏：裸数组元素期望 " + ek + "，实得 " + r2["rep"])
				parts.append(r2["code"])
			return ["let " + s["name"] + ": " + AB.raw_elem_ts(ek) + "[] = [" + ", ".join(parts) + "];"]
		var dk = CTX.ctx["RAW_DICTS"].get(s["name"])
		if dk != null and s.get("init") != null and s["init"].get("kind") == "dict":
			var pairs = []
			for en in s["init"]["entries"]:
				var kr = EB.emit_expr_r(en["key"])
				if kr.get("__error") != null:
					return err(kr["__error"], kr["message"])
				var vr = EB.emit_expr_r(en["value"])
				if vr.get("__error") != null:
					return err(vr["__error"], vr["message"])
				if kr["rep"] != "int" and kr["rep"] != "str":
					return err("raw-dict-key", "内部不变量破坏：裸字典键期望 int/str，实得 " + kr["rep"])
				if vr["rep"] != dk:
					return err("raw-dict-init", "内部不变量破坏：裸字典值期望 " + dk + "，实得 " + vr["rep"])
				pairs.append("[" + kr["code"] + ", " + vr["code"] + "]")
			return ["let " + s["name"] + " = new Map<unknown, " + AB.raw_elem_ts(dk) + ">([" + ", ".join(pairs) + "]);"]
		if s.get("init") != null and CTX.ctx["UNBOXED"].has(s["name"]):
			var rr = EB.emit_expr_r(s["init"])
			if rr.get("__error") != null:
				return err(rr["__error"], rr["message"])
			return ["let " + s["name"] + " = " + rr["code"] + ";"]
		var raw = "null"
		if s.get("init") != null:
			var se = EB.emit_expr_safe(s["init"])
			if se is Dictionary:
				return err(se["__error"], se["message"])
			raw = se
		var init = HE.stamp_decl(s.get("type"), raw, s.get("init") != null, false)
		var cast = AB.declared_cast(s.get("type"))
		if cast != null:
			return ["let " + s["name"] + " = " + cast + "(" + init + ");"]
		return ["let " + s["name"] + " = " + init + ";"]
	if kind == "expr":
		var er = EB.emit_expr_r(s["expr"])
		if er.get("__error") != null:
			return err(er["__error"], er["message"])
		return [er["code"] + ";"]
	if kind == "assign":
		var bare = HE.unwrap_self_member(s["target"])
		if bare != null:
			var merged = s.duplicate()
			merged["target"] = bare
			return emit_stmt(merged, void_return)
		if s["target"].get("kind") == "index" and s["target"]["obj"].get("kind") == "ident":
			var dk2 = CTX.ctx["RAW_DICTS"].get(s["target"]["obj"]["name"])
			if dk2 != null:
				var kr2 = EB.emit_expr_r(s["target"]["index"])
				if kr2.get("__error") != null:
					return err(kr2["__error"], kr2["message"])
				var vr2 = EB.emit_expr_r(s["value"])
				if vr2.get("__error") != null:
					return err(vr2["__error"], vr2["message"])
				if kr2["rep"] != "int" and kr2["rep"] != "str":
					return err("raw-dict-key", "内部不变量破坏：裸字典键期望 int/str，实得 " + kr2["rep"])
				if vr2["rep"] != dk2:
					return err("raw-dict-set", "内部不变量破坏：裸字典值期望 " + dk2 + "，实得 " + vr2["rep"])
				return [s["target"]["obj"]["name"] + ".set(" + kr2["code"] + ", " + vr2["code"] + ");"]
		if s["target"].get("kind") == "ident":
			var ub = CTX.ctx["UNBOXED"].get(s["target"]["name"])
			if ub != null:
				var vr3 = EB.emit_expr_r(s["value"])
				if vr3.get("__error") != null:
					return err(vr3["__error"], vr3["message"])
				var raw2 = vr3["code"]
				if vr3["rep"] != ub:
					var fn = "toInt" if ub == "int" else ("toFloat" if ub == "float" else "strOf")
					raw2 = "rt." + fn + "(" + EB.box_r(vr3) + ").v"
				return [s["target"]["name"] + " = " + raw2 + ";"]
		var raw_write = AB.emit_raw_index_write(s["target"], s["value"])
		if raw_write != null:
			return [raw_write]
		if s["target"].get("kind") == "attribute" or s["target"].get("kind") == "index":
			var vw = EB.emit_value_write(s["target"], s["value"])
			if vw != null:
				return vw
		if s["target"].get("kind") == "ident" and _an_engine_prop(s["target"]):
			return ["rt.writeProp(rt.V.object(this), " + JSON.stringify(s["target"]["name"]) + ", " + EB.emit_expr(s["value"]) + ");"]
		return [EB.emit_assign(s["target"], EB.emit_expr(s["value"]), s["value"])]
	if kind == "return":
		if s.get("value") == null:
			return ["return;"]
		if CTX.ctx["CURRENT_RET"] != null:
			var rr3 = EB.emit_expr_r(s["value"])
			if rr3.get("__error") != null:
				return err(rr3["__error"], rr3["message"])
			if rr3["rep"] != CTX.ctx["CURRENT_RET"]:
				return err("raw-abi-return", "内部不变量破坏：裸函数返回期望 " + str(CTX.ctx["CURRENT_RET"]) + "，实得 " + rr3["rep"])
			return ["return " + rr3["code"] + ";"]
		var code = EB.emit_expr(s["value"])
		var text = null
		if CTX.ctx["LAMBDA_DEPTH"] == 0:
			text = HE.container_ann_text(CTX.ctx["CURRENT_RET_ANN"])
		var wrapped = AB.container_slot(code, s["value"], text, "returnContainer")
		if void_return:
			return ["return void (" + wrapped + ");"]
		return ["return " + wrapped + ";"]
	if kind == "if":
		var lines = []
		var i = 0
		for br in s["branches"]:
			var prefix = "" if i == 0 else "} "
			var kw = "if"
			if i > 0:
				kw = "else if" if br.get("cond") != null else "else"
			var cond = ""
			if br.get("cond") != null:
				cond = " (" + cond_expr(br["cond"]) + ")"
			lines.append(prefix + kw + cond + " {")
			for st in br["body"]:
				for line in emit_stmt(st, void_return):
					lines.append("  " + line)
			i += 1
		lines.append("}")
		return lines
	if kind == "for":
		var body = []
		for st2 in s["body"]:
			for l2 in emit_stmt(st2, void_return):
				body.append("  " + l2)
		var is_range = HE.is_range_call(s["iter"])
		if is_range and CTX.ctx["UNBOXED"].get(s["var"]) == "int":
			var parts = []
			for a in s["iter"]["args"]:
				parts.append(EB.emit_expr(a))
			var head = "for (let " + s["var"] + " of rt.rangeSeq(" + HE.range_arg_list(parts) + ")) {"
			var out = [head]
			for l3 in body:
				out.append(l3)
			out.append("}")
			return out
		var out2 = ["for (let " + s["var"] + " of rt.iter(" + EB.emit_expr(s["iter"]) + ")) {"]
		for l4 in body:
			out2.append(l4)
		out2.append("}")
		return out2
	if kind == "while":
		var out3 = ["while (" + cond_expr(s["cond"]) + ") {"]
		for st3 in s["body"]:
			for l5 in emit_stmt(st3, void_return):
				out3.append("  " + l5)
		out3.append("}")
		return out3
	if kind == "break":
		return ["break;"]
	if kind == "continue":
		return ["continue;"]
	if kind == "pass":
		return ["/* pass */"]
	if kind == "match":
		var subject = EB.emit_expr(s["subject"])
		var lines2 = ["do {"]
		var idx = 0
		for arm in s["arms"]:
			var m = "__m" + str(idx)
			var guard = ""
			if arm.get("guard") != null:
				guard = " && rt.ops.truthy(" + EB.emit_expr(arm["guard"]) + ")"
			lines2.append("  const " + m + " = rt.matchPattern(" + subject + ", " + EB.emit_pattern(arm["pattern"]) + ");")
			lines2.append("  if (" + m + " !== null" + guard + ") {")
			var names = LAY.pattern_names(arm["pattern"])
			var ni = 0
			for nm in names:
				lines2.append("    const " + nm + " = " + m + "[" + str(ni) + "] as rt.Variant;")
				ni += 1
			for st4 in arm["body"]:
				for l6 in emit_stmt(st4, void_return):
					lines2.append("    " + l6)
			lines2.append("    break;")
			lines2.append("  }")
			idx += 1
		lines2.append("} while (false);")
		return lines2
	return err("emit-stmt", "语句 " + str(kind) + " 还没实现")
