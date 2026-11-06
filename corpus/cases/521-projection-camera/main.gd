extends SceneTree
func _initialize():
	var p := Projection(Vector4(0.974279, 0, 0, 0), Vector4(0, 1.732051, 0, 0), Vector4(0, 0, -1.002002, -1), Vector4(0, 0, -0.2002, 0))
	print("z|", p.get_z_near(), "|", p.get_z_far())
	print("fov|", p.get_fov(), "|", p.get_fovy(60.0, 16.0 / 9.0))
	print("asp|", p.get_aspect())
	print("vp|", p.get_viewport_half_extents())
	print("fp|", p.get_far_plane_half_extents())
	print("ppm|", p.get_pixels_per_meter(10))
	print("lod|", p.get_lod_multiplier())
	quit()
