extends SceneTree


class A:
	func im():
		return 1

	static func sm():
		return 2


func _initialize():
	var a = A.new()
	a.set_meta("k", 5)
	a.set_meta(&"sn", 6)
	print("t1 ", a.has_meta("sn"), " ", a.get_meta("sn"))
	a.remove_meta("k")
	print("t2 ", a.has_meta("k"), " ", a.get_meta("k", 99))
	print("t3 ", self.get_class(), " | ", a.get_class())
	print("t4 ", a.has_method("sm"), " ", a.has_method("get_class"))
	print("t5 ", self.has_method("_initialize"), " ", self.has_method("print"))
	print("t6 ", a.has_method(""))
	a.set_meta("k", 8)
	print("t7 ", a.get_meta("k"), " ", a.get_meta("nope", "dflt"))
	print("t8 ", typeof(a.get_meta("nope", [1, 2])))
	quit()
