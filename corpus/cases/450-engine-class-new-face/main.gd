extends SceneTree

func _initialize():
	var n = Node.new
	print("f01|", typeof(n), "|", typeof(RefCounted.new), "|", typeof(Object.new), "|", typeof(Resource.new), "|", typeof(FileAccess.new), "|", typeof(GDScript.new))
	print("f02|", n == Node.new, "|", n == RefCounted.new, "|", Node.new == Node.new)
	print("f03|", n.get_method(), "|", RefCounted.new.get_method(), "|", FileAccess.new.get_method())
	print("f04|", n.is_valid(), "|", RefCounted.new.is_valid(), "|", Object.new.is_valid())
	print("f05|", n.get_argument_count(), "|", Resource.new.get_argument_count(), "|", GDScript.new.get_argument_count())
	var b = n.bind(1)
	print("f06|", b.get_argument_count(), "|", b.get_method(), "|", b.is_valid())
	print("f07|", n.is_null(), "|", RefCounted.new.is_null())
	var d = {Node.new: 1}
	print("f08|", d.size(), "|", d.has(Node.new), "|", d[Node.new])
	print("f09|", str(Node.new), "|", str(Resource.new), "|", str(FileAccess.new))
	quit()
