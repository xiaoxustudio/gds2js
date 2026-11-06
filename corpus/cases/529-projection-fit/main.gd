extends SceneTree
func _initialize():
	print(Projection.create_fit_aabb(AABB(Vector3(0, 0, 0), Vector3(2, 2, 2))))
	print(Projection.create_fit_aabb(AABB(Vector3(1, 2, 3), Vector3(2, 2, 2))))
	quit()
