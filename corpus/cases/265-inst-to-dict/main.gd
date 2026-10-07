extends SceneTree

class Inner extends RefCounted:
	const C = 7
	static var sv = 5
	signal sig
	var k = 1
	var s = "x"

class Empty extends RefCounted:
	pass

class Base extends RefCounted:
	var a = 1

class Derived extends Base:
	var b = 2

class Acc extends RefCounted:
	var _v = 1
	var ai: int:
		get: return 42
	var af: float:
		get: return 1.5
	var ab: bool:
		get: return true
	var ast: String:
		get: return "hi"
	var asn: StringName:
		get: return &"hi"
	var av: Vector2:
		get: return Vector2(1, 2)
	var avi: Vector2i:
		get: return Vector2i(1, 2)
	var av3: Vector3:
		get: return Vector3(1, 2, 3)
	var av3i: Vector3i:
		get: return Vector3i(1, 2, 3)
	var ac: Color:
		get: return Color(0.5, 0.5, 0.5, 0.5)
	var anp: NodePath:
		get: return NodePath("a/b")
	var ad: Array:
		get: return [1]
	var adi: Dictionary:
		get: return {}
	var au:
		get: return 7
	var apb: PackedByteArray:
		get: return PackedByteArray([1])
	var aps: PackedStringArray:
		get: return PackedStringArray(["x"])

class Box extends RefCounted:
	var plain
	var typedint: int
	var typedstr: String
	var nilf = null
	var arr = [1, 2]
	var d = {"a": 1}
	var sn = &"s"
	var np = NodePath("a/b")
	var rid = rid_from_int64(5)
	var leaf = null

class WithInit extends RefCounted:
	var touched = 0

	func _init():
		touched = 99

func _initialize():
	var i = Inner.new()
	var di = inst_to_dict(i)
	print("t01|", typeof(di))
	print("t02|", di)
	print("t03|", str(di["@subpath"]))
	print("t04|", typeof(di["@subpath"]))
	print("t05|", typeof(di["@path"]))
	print("t06|", di.has("sig"))
	print("t07|", di.has("C"))
	print("t08|", di.has("sv"))
	print("t09|", di.size())
	print("t10|", di.keys())
	print("t11|", inst_to_dict(Empty.new()))
	print("t12|", inst_to_dict(Derived.new()))
	print("t13|", inst_to_dict(Acc.new()))
	print("t14|", inst_to_dict(Box.new()))
	print("t15|", inst_to_dict(self))
	print("t16|", typeof(inst_to_dict(null)))
	print("t17|", var_to_str(inst_to_dict(Inner.new())))
	var b = Box.new()
	b.leaf = i
	print("t18|", inst_to_dict(b))
	print("t19|", inst_to_dict(b)["leaf"] == i)
	print("t20|", str(di["@path"]) == str(inst_to_dict(Inner.new())["@path"]))
	print("t21|", di[&"k"])
	print("t22|", inst_to_dict(WithInit.new())[&"touched"])
	print("t23|", inst_to_dict(i) == inst_to_dict(i))
	print("t24|", di["@subpath"] == NodePath("Inner"))
	print("t25|", di["@path"] == str(di["@path"]))
	print("t26|", inst_to_dict(b)["leaf"].get_instance_id() == i.get_instance_id())
	print("t27|", str(inst_to_dict(Acc.new())["au"]))
	quit()
