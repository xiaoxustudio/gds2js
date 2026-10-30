extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", str(j), "|", typeof(j), "|", j is JSON, "|", j.get_class(), "|", j == null, "|", j is Object, "|", j.is_class("JSON"))
	quit()
