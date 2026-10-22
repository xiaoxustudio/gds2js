extends SceneTree

class Inner:
	pass

class Kid extends RefCounted:
	pass

class Big extends Kid:
	pass

var mod: Array[Inner] = []

func _initialize():
	var a: Array[Inner] = [Inner.new()]
	print("A=", a.is_typed(), " ", a.get_typed_class_name(), " ", typeof(a[0]), " ", a.size())
	var k: Array[Kid] = []
	var b: Array[Big] = []
	print("B=", k.is_typed(), k.get_typed_class_name(), b.is_typed(), b.get_typed_class_name())
	var alias: Array[Inner] = mod
	mod.append(Inner.new())
	print("C=", alias.size(), " ", alias.is_typed())
	var w: Variant = a
	var through: Array[Inner] = w
	print("D=", through.size(), " ", through.is_typed())
	print("E=", a.get_typed_builtin())
	quit()
