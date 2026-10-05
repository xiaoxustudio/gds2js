extends SceneTree

func _initialize():
	var builtins = ["Nil", "bool", "int", "float", "String", "Vector2", "Vector2i", "Rect2", "Rect2i", "Vector3", "Vector3i", "Transform2D", "Vector4", "Vector4i", "Plane", "Quaternion", "AABB", "Basis", "Transform3D", "Projection", "Color", "StringName", "NodePath", "RID", "Object", "Callable", "Signal", "Dictionary", "Array", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray", "PackedVector4Array"]
	for x in builtins:
		print("b|", x, "|", type_exists(x))
	var classes = ["Node", "Node2D", "Resource", "RefCounted", "HTTPRequest", "GDScript", "SceneTree", "MainLoop", "Node3D", "Camera2D", "Label", "godot", "Variant", "CharacterBody2D", "RenderingDevice", "AudioStreamPlayback"]
	for x in classes:
		print("c|", x, "|", type_exists(x))
	var misses = ["", " ", "node", "Int", "INT", "No Such", "Vector", "Str", "Object ", "TYPE_INT", "[Node]"]
	for x in misses:
		print("m|", x, "|", type_exists(x))
	print("k01|", typeof(type_exists("Node")))
	print("k02|", type_exists("ImageFormat"), "|", type_exists("TextServer"), "|", type_exists("PhysicsServer2D"))
	print("k03|", type_exists("SQLite"), "|", type_exists("EditorNode"), "|", type_exists("JSValue"), "|", type_exists("PlaceHolderTexture2D"))
	var f = type_exists
	print("z01|", typeof(f), "|", f, "|", f.get_method(), "|", f.get_argument_count())
	print("z02|", hash(type_exists), "|", hash("type_exists"), "|", type_exists == type_exists, "|", type_exists == error_string)
	quit()
