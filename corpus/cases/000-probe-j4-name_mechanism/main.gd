extends SceneTree

func _initialize():
	print("a|", JSON.new().get("name"), "|", Resource.new().get("name"), "|", RefCounted.new().get("name"), "|", Node.new().get("name"))
	print("b|", str(JSON.new()), "|", str(Node.new()))
	var r := Resource.new()
	r.name = &"abc"
	print("c|", str(r))
	quit()
