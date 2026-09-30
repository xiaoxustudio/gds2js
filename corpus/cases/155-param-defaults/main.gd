extends SceneTree

const K = 11

class A extends RefCounted:
	static func sf(a: int, b: int = 9) -> String:
		return "sf=%d/%d" % [a, b]

	func one(a: int, b: int = 5) -> String:
		return "one=%d/%d" % [a, b]

	func expr_default(a = 1 + 2) -> String:
		return "e=%s" % [str(a)]

	func arr_default(a = [1, 2]) -> String:
		a.append(99)
		return "arr=%s" % [str(a)]

	func vec_default(v = Vector2(1, 2)) -> String:
		return "v=%s" % [str(v)]

	func null_default(a = null) -> String:
		return "n=%s" % [str(a)]

	func refs_earlier(a: int, b = a) -> String:
		return "r=%d/%d" % [a, b]

	func const_default(a = K) -> String:
		return "c=%d" % [a]

	func method_default(a = 2) -> String:
		return "d=%d/%d" % [a, helper()]

	func helper() -> int:
		return 7

	func str_slot(a: String = "hi") -> String:
		return "s=[" + a + "]"

	func float_into_int_slot(a: int = 2.7) -> String:
		return "m=%d" % a

	func float_into_int_math(a: int = 2.7) -> String:
		return "mm=%s|%s" % [str(a), str(a + 0.5)]

	func call_it() -> String:
		return "%s|%s" % [expr_default(), method_default()]

class Needs extends RefCounted:
	var a: int

	func _init(p_a: int = 7):
		a = p_a
		print("n=%d" % p_a)

func _initialize():
	var x = A.new()
	print("t1 ", x.one(1))
	print("t2 ", x.one(1, 2))
	print("t3 ", x.arr_default())
	print("t4 ", x.arr_default())
	print("t5 ", x.vec_default(), " ", x.null_default())
	print("t6 ", x.refs_earlier(3), " ", x.refs_earlier(3, 7))
	print("t7 ", x.const_default(), " ", x.call_it())
	print("t8 ", x.str_slot(), " ", x.str_slot(&"nm"))
	print("t9 ", x.float_into_int_slot())
	print("t9b ", x.float_into_int_math())
	print("t10 ", A.sf(1), " ", A.sf(1, 2))
	var cb = x.one
	print("t11 ", cb.call(1), " ", cb.call(1, 2))
	print("t13")
	var n1 = Needs.new()
	var n2 = Needs.new(4)
	print("t14 ", n1.a, " ", n2.a)
	quit()
