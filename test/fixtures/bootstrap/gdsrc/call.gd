const CTX = preload("res://context.gd")
const EB = preload("res://expr_boxed.gd")
const GLOB = preload("res://globals.gd")
const HE = preload("res://helpers.gd")
const IRF = preload("res://ir.gd")
const LAY = preload("res://layout.gd")
const BT = preload("res://builtin_tables.gd")

const BINOP = {
	"+": "add",
	"-": "sub",
	"*": "mul",
	"/": "div",
	"%": "mod",
	"**": "pow",
	"==": "eq",
	"!=": "neq",
	"<": "lt",
	"<=": "lte",
	">": "gt",
	">=": "gte",
	"<<": "shl",
	">>": "shr",
	"&": "band",
	"|": "bor",
	"^": "bxor",
}

static var failed = false
static var last_error = null


static func err(code, message):
	failed = true
	last_error = {"__error": code, "message": message}
	return ""


static func builtin_emit(name, args):
	if BT.FIXED.has(name):
		var t = BT.FIXED[name]
		for i in args.size():
			t = t.replace("{" + str(i) + "}", args[i])
		return t
	if BT.JOIN.has(name):
		var row = BT.JOIN[name]
		return row[0] + ", ".join(args) + row[1]
	return null


static func emit_binary(e):
	var l = EB.emit_expr(e["left"])
	var r = EB.emit_expr(e["right"])
	var op = e.get("op")
	if op == "%":
		var soft = "true" if (LAY.pct_static_side(e["left"]) and LAY.pct_static_side(e["right"])) else "false"
		if e["left"].get("kind") == "lit" and e["left"].get("lit") == "string":
			return "rt.formatOf(" + l + ", " + r + ", " + soft + ")"
		return "rt.ops.mod(" + l + ", " + r + ", " + soft + ")"
	if op == "in":
		return "rt.ops.inOp(" + l + ", " + r + ")"
	if op == "and":
		return "rt.and(" + l + ", () => " + r + ")"
	if op == "or":
		return "rt.or(" + l + ", () => " + r + ")"
	var fn = BINOP.get(op)
	if fn == null:
		return err("emit-binary", "二元运算符 " + str(op) + " 还没实现")
	return "rt.ops." + fn + "(" + l + ", " + r + ")"


static func _lit_of(e):
	if e != null and e.get("kind") == "lit" and e.get("lit") == "string":
		return String(e["value"])
	return null


static func emit_call(e):
	var args = []
	for a in e["args"]:
		args.append(EB.emit_expr(a))
	var callee = e["callee"]
	if callee.get("kind") == "ident":
		var name = callee["name"]
		var joined = ", ".join(args)
		if name == "print":
			return "print(rt.showArgs([" + joined + "]))"
		if name == "prints":
			return "printJoined(\" \", [" + joined + "])"
		if name == "printt":
			return "printJoined(\"\\t\", [" + joined + "])"
		if name == "printraw":
			return "printRaw([" + joined + "])"
		if name == "printerr":
			return "printErr([" + joined + "])"
		if name == "print_verbose":
			return "printVerbose([" + joined + "])"
		if name == "print_rich":
			return "printRich([" + joined + "])"
		if name == "print_debug":
			var fn_label = "<anonymous lambda>" if CTX.ctx["LAMBDA_DEPTH"] > 0 else CTX.ctx["CURRENT_FUNC"]
			return "printDebug([" + joined + "], " + JSON.stringify(CTX.ctx["DEBUG_FILE"]) + ", " + str(e["loc"]["line"]) + ", " + JSON.stringify(fn_label) + ")"
		if name == "preload":
			var lit = _lit_of(e["args"][0] if e["args"].size() > 0 else null)
			if lit != null and CTX.ctx["PRELOADS"].has(lit):
				return "rt.loadScript(" + JSON.stringify(lit) + ")"
			return err("emit-preload", "preload(" + ("非字面量" if lit == null else lit) + ") 未解析到工程内的 .gd（跨文件编译需能定位该脚本）")
		if name == "load":
			var lit2 = _lit_of(e["args"][0] if e["args"].size() > 0 else null)
			if lit2 != null and CTX.ctx["LOADS"].has(lit2):
				return "rt.loadScript(" + JSON.stringify(CTX.ctx["LOADS"][lit2]) + ")"
			return "rt.loadScript(" + (args[0] if args.size() > 0 else "undefined") + ")"
		var builtin = builtin_emit(name, args)
		if builtin != null:
			return builtin
		if name == "super":
			if not CTX.ctx["INIT_HAS_BASE"]:
				return err("emit-super-ctor", str(CTX.ctx["CURRENT_CLASS"]) + " 没有脚本基类，super() 这一格还没实测过，不发")
			if CTX.ctx["IN_INIT"]:
				return "super._init(" + joined + ")"
			var cur = CTX.ctx["CURRENT_FUNC"]
			if cur == null or cur == "" or CTX.ctx["STATIC_FUNCS"].has(cur):
				return err("emit-super-ctor", "静态方法里的 super() 没实测过，不发")
			return "super." + cur + "(" + joined + ")"
		if CTX.ctx["STATIC_FUNCS"].has(name):
			return str(CTX.ctx["CURRENT_CLASS"]) + "." + name + "(" + joined + ")"
		if not HE.callable_in_scope(name):
			if CTX.ctx["ENGINE_BASE"] != null and GLOB.NODE_SELF_METHODS.has(name):
				return "rt.method(this, " + JSON.stringify(name) + ", [" + joined + "])"
			return err("call-unknown", "Function \"" + name + "()\" not found in base self.")
		return "this." + name + "(" + ", ".join(HE.pack_typed_args(name, e["args"], args, "this")) + ")"
	if callee.get("kind") == "attribute":
		var obj = callee["obj"]
		if obj.get("kind") == "ident" and obj["name"] == "super":
			return "super." + callee["name"] + "(" + ", ".join(args) + ")"
		if obj.get("kind") == "ident" and obj["name"] == "self":
			var own = callee["name"]
			if CTX.ctx["STATIC_FUNCS"].has(own):
				return str(CTX.ctx["CURRENT_CLASS"]) + "." + own + "(" + ", ".join(args) + ")"
			if CTX.ctx["MODULE_FUNCS"].has(own) or CTX.ctx["CURRENT_MEMBERS"].has(own) or CTX.ctx["MODULE_VARS"].has(own):
				return "this." + own + "(" + ", ".join(HE.pack_typed_args(own, e["args"], args, "this")) + ")"
			return "rt.method(rt.V.object(this), " + JSON.stringify(own) + ", [" + ", ".join(args) + "])"
		if callee.get("name") == "new" and obj.get("kind") == "ident" and CTX.ctx["MODULE_CLASSES"].has(obj["name"]):
			return "rt.V.object(new " + obj["name"] + "(" + ", ".join(args) + "))"
		if callee.get("name") == "new" and obj.get("kind") == "attribute" and obj["obj"].get("kind") == "ident":
			var shared = CTX.ctx["PRELOAD_FACE_OWNERS"].get(obj["obj"]["name"])
			if shared != null and shared["names"].has(obj["name"]):
				return "rt.V.object(new " + shared["cls"] + "." + obj["name"] + "(" + ", ".join(args) + "))"
		var static_fn = IRF.static_member_fn(obj)
		if static_fn != null:
			return "rt." + static_fn + "(" + JSON.stringify(callee["name"]) + ", [" + ", ".join(args) + "])"
		var obj_code = EB.emit_expr(obj)
		return "rt.method(" + obj_code + ", " + JSON.stringify(callee["name"]) + ", [" + ", ".join(args) + "])"
	return err("emit-call", "不支持的调用形式")
