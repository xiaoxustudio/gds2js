extends SceneTree

const PJ = preload("res://project.gd")


static func _to_slash(p) -> String:
	return String(p).replace("\\", "/")


static func _dirname(p) -> String:
	var idx = p.rfind("/")
	if idx <= 0:
		return p
	if idx == 2 and p.substr(1, 1) == ":":
		return p.substr(0, 3)
	return p.substr(0, idx)


static func _write_text(path, text):
	var dir = _dirname(path)
	DirAccess.make_dir_recursive_absolute(dir)
	var f = FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		return false
	f.store_string(text)
	f.close()
	return true


static func compile_one(res_root, out_dir, runtime_import, entry_path):
	var entries = [entry_path if entry_path != "" else res_root + "/main.gd"]
	var opts = {
		"entries": entries,
		"resRoot": res_root,
		"outDir": out_dir,
		"closureOnly": entry_path != "",
		"runtimeImport": runtime_import,
		"hostImport": "gds2js/host",
		"autoRun": null,
		"runtimeMode": "import",
	}
	var res = PJ.compile_project(opts)
	if res == null:
		return {"error": "null"}
	if res.has("__error"):
		return res
	for m in res["modules"]:
		if not _write_text(m["jsPath"], m["code"]):
			return {"__error": "write-error", "message": m["jsPath"]}
		if m.has("map"):
			_write_text(m["jsPath"] + ".map", JSON.stringify(m["map"]))
	return {"modules": res["modules"].size(), "diags": res["diags"].size()}


func _initialize():
	var args = OS.get_cmdline_user_args()
	if args.size() < 3:
		printerr("用法: -- <resRoot> <outDir> <runtimeImport> [entry | batch]")
		quit(2)
		return
	var res_root = _to_slash(args[0])
	var out_dir = _to_slash(args[1])
	var runtime_import = args[2]
	if args.size() > 3 and args[3] == "batch":
		var names = []
		var da = DirAccess.open(res_root)
		if da == null:
			printerr("batch-error: " + res_root)
			quit(1)
			return
		da.list_dir_begin()
		var name = da.get_next()
		while name != "":
			if da.current_is_dir() and not name.begins_with(".") and FileAccess.file_exists(res_root + "/" + name + "/main.gd"):
				names.append(name)
			name = da.get_next()
		da.list_dir_end()
		names.sort()
		var ok = 0
		var verbose = OS.get_environment("GDS2JS_VERBOSE") == "1"
		for n in names:
			if verbose:
				printerr("case: " + n)
			var one = compile_one(res_root + "/" + n, out_dir + "/" + n, runtime_import, "")
			if one is Dictionary and one.has("__error"):
				printerr("case-error: " + n + " " + one["__error"])
			else:
				ok += 1
		printerr("batch: " + str(ok) + "/" + str(names.size()))
		quit(0)
		return
	var entry_path = _to_slash(args[3]) if args.size() > 3 else ""
	var res = compile_one(res_root, out_dir, runtime_import, entry_path)
	if res is Dictionary and res.has("__error"):
		printerr("compile-error: " + res["__error"] + " " + res["message"])
		quit(1)
		return
	printerr("compiled: " + str(res["modules"]) + " modules, " + str(res["diags"]) + " diags")
	quit(0)
