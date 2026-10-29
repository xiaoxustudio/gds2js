extends SceneTree

func _initialize():
	var n := Node3D.new()
	print("a|", n is Node3D, "|", n is Node, "|", n is Object, "|", n.get_class(), "|", n.is_class("Node3D"), "|", n.is_class("VisualInstance3D"))
	quit()
