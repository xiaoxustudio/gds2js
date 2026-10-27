extends SceneTree

func _initialize():
	var n := Node3D.new()
	print("n|a1|", n.position, "|", n.rotation, "|", n.rotation_degrees, "|", n.scale, "|", n.visible, "|", n.get_class())
	n.position = Vector3(1, 2, 3)
	n.rotation = Vector3(0.1, 0.2, 0.3)
	n.scale = Vector3(2, 2, 2)
	print("n|a2|", n.position, "|", n.rotation, "|", n.rotation_degrees, "|", n.scale)
	print("n|a3|", n.basis)
	var c := Node3D.new()
	print("n|a4|", c.basis, "|", str(n))
	n.visible = false
	print("n|a5|", n.visible)
	n.free()
	c.free()
	quit()
