extends SceneTree

class Inner extends RefCounted:
	var v = 1

	func m(x):
		return x

func row(tag: String, x: Variant) -> void:
	print(tag, "|", x is Object, "|", x is RefCounted, "|", x is Resource, "|", x is GDScript, "|", x is Callable, "|", x is Vector2, "|", x is Array, "|", typeof(x))

func _initialize():
	var o = Inner.new()
	row("y01", o)
	row("y02", Inner)
	row("y03", Vector2(1, 2))
	row("y04", [1, 2])
	row("y05", {1: 2})
	row("y06", PackedByteArray([1]))
	row("y07", "x")
	row("y08", 1)
	row("y09", o.m)
	row("y10", Callable())
	row("y11", null)
	row("y12", self)
	print("y13|", o.m.get_object() is RefCounted, "|", o.m.get_object() is Object, "|", o.m.get_object() is Inner)
	print("y14|", o.m.get_object() is Resource, "|", o.m.get_object() is GDScript, "|", o.m.get_object() is Node)
	quit()
