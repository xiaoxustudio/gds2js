extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", j.has_method("stringify"), "|", j.has_method("parse_string"), "|", j.has_method("parse"), "|", j.has_method("get_data"), "|", j.has_method("get_error_line"))
	print("b|", j.get_method_list().size(), "|", j.get_property_list().size())
	quit()
