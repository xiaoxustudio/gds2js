extends SceneTree

func _initialize():
	print("c1|", Basis.IDENTITY, "|", Basis.FLIP_X, "|", Basis.FLIP_Y, "|", Basis.FLIP_Z)
	print("c2|", Quaternion.IDENTITY)
	print("c3|", Plane.PLANE_XY, "|", Plane.PLANE_XZ, "|", Plane.PLANE_YZ)
	print("c4|", Transform2D.IDENTITY, "|", Transform2D.FLIP_X, "|", Transform2D.FLIP_Y)
	print("c5|", Transform3D.IDENTITY, "|", Transform3D.FLIP_X, "|", Transform3D.FLIP_Y, "|", Transform3D.FLIP_Z)
	print("c6|", Projection.IDENTITY, "|", Projection.ZERO)
	print("c7|", Projection.PLANE_NEAR, "|", Projection.PLANE_FAR, "|", Projection.PLANE_LEFT, "|", Projection.PLANE_TOP, "|", Projection.PLANE_RIGHT, "|", Projection.PLANE_BOTTOM)
	print("c8|", Vector3.MODEL_LEFT, "|", Vector3.MODEL_RIGHT, "|", Vector3.MODEL_TOP, "|", Vector3.MODEL_BOTTOM, "|", Vector3.MODEL_FRONT, "|", Vector3.MODEL_REAR)
	print("c9|", Vector4.AXIS_W, "|", Vector4i.AXIS_W)
	quit()
