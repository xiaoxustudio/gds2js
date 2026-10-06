extends SceneTree

class Plain:
	var k = 1

class Inner extends RefCounted:
	var k = 1
	signal fired

	func meth():
		return k

func _initialize():
	var a = Inner.new()
	var b = Inner.new()
	var p = Plain.new()
	print("s01|", a)
	print("s02|", p)
	print("s03|", [a, b])
	print("s04|", {"k": a})
	print("s05|", a == a)
	print("s06|", a == b)
	print("s07|", a.get_instance_id() == a.get_instance_id())
	print("s08|", a.get_instance_id() == b.get_instance_id())
	print("s09|", typeof(a.get_instance_id()))
	print("s10|", instance_from_id(a.get_instance_id()) == a)
	print("s11|", instance_from_id(a.get_instance_id()))
	print("s12|", instance_from_id(12345) == null)
	print("s13|", typeof(instance_from_id(12345)))
	print("s14|", instance_from_id(12345))
	print("s15|", is_instance_valid(a))
	print("s16|", is_instance_valid(self))
	print("s17|", is_instance_valid(Inner))
	print("s18|", is_instance_valid(null))
	print("s19|", is_instance_valid(5))
	print("s20|", is_instance_valid("s"))
	print("s21|", is_instance_valid(Vector2(1, 2)))
	print("s22|", is_instance_valid([1]))
	print("s23|", is_instance_valid({}))
	print("s24|", is_instance_valid(a.meth))
	print("s25|", is_instance_valid(a.fired))
	print("s26|", is_instance_valid(instance_from_id(12345)))
	print("s27|", is_instance_id_valid(a.get_instance_id()))
	print("s28|", is_instance_id_valid(12345))
	print("s29|", is_instance_id_valid(0))
	print("s30|", typeof(weakref(a)))
	print("s31|", weakref(a).get_ref() == a)
	print("s32|", weakref(null).get_ref())
	print("s33|", is_instance_valid(weakref(a)))
	print("s34|", typeof(weakref(null)))
	print("s35|", weakref(a) == weakref(a))
	print("s36|", Node)
	print("s37|", typeof(Node))
	print("s39|", weakref(a).get_ref().k)
	print("s40|", a.get_instance_id() < b.get_instance_id())
	quit()
