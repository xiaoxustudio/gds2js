extends SceneTree
func _initialize():
	var p := Projection.create_perspective(60.0, 16.0 / 9.0, 0.1, 100.0)
	print("adj|", p.perspective_znear_adjusted(0.2))
	print("jit|", p.jitter_offseted(Vector2(1, 2)))
	for i in [0, 2, 3, 4, 5]: print("pl|", i, "|", p.get_projection_plane(i))
	quit()
