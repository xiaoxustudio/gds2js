extends SceneTree
func _initialize():
	var n := Node3D.new()
	n.position = Vector3(1, 2, 3)
	n.rotate_x(0.5)
	print("rx|", n.basis, "|", n.position)
	n.rotate_y(0.4)
	print("ry|", n.basis, "|", n.position)
	n.rotate_z(0.3)
	print("rz|", n.basis, "|", n.position)
	n.free()
	quit()
