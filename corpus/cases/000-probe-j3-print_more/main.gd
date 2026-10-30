extends SceneTree

func _initialize():
	print("a|", str(JSON), "|", typeof(JSON), "|", str(JSON.new()))
	print("iid|", JSON.new().get_instance_id())
	quit()
