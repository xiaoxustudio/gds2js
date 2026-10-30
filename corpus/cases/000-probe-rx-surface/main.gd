extends SceneTree

func _initialize():
	var r = RegEx.new()
	print("a|", r != null, "|", typeof(r), "|", r.get_class(), "|", r is RegEx, "|", r is RefCounted, "|", r is Object, "|", r.is_class("RegEx"))
	print("b|", str(r))
	print("f|", typeof(RegEx), "|", str(RegEx))
	var names := []
	for e in r.get_method_list():
		names.append(e["name"])
	names.sort()
	print("m|", ";".join(names))
	quit()
