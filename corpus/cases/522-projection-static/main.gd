extends SceneTree
func _initialize():
	var p := Projection.create_perspective(60.0, 16.0 / 9.0, 0.1, 100.0)
	print("p|", p)
	print("z|", p.get_z_near(), "|", p.get_z_far())
	var o := Projection.create_orthogonal(-2, 2, -1, 1, 0.1, 100)
	print("o|", o)
	print("oz|", o.get_z_near(), "|", o.get_z_far(), "|", o.is_orthogonal())
	quit()
