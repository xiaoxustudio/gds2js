extends SceneTree

func _initialize():
	print("a|", str(JSON.new()), "|", str(RefCounted.new()), "|", str(Resource.new()))
	print("iid|", JSON.new().get_instance_id())
	var a := JSON.new()
	var b := JSON.new()
	print("b|", a == b, "|", a == a, "|", a is JSON, "|", a is RefCounted, "|", a.is_class("RefCounted"), "|", a.get_class())
	quit()
