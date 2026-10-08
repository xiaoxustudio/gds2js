extends SceneTree

class Inner extends RefCounted:
	var k = 1
	var s = "x"

class Empty extends RefCounted:
	pass

class Base extends RefCounted:
	var a = 1

class Derived extends Base:
	var b = 2

class WithInit extends RefCounted:
	var touched = 0

	func _init():
		touched = 99
		print("SIDE")

class Acc extends RefCounted:
	var _v = 1
	var v:
		get:
			return _v
		set(x):
			_v = x * 10

class Box extends RefCounted:
	var plain
	var arr = [1, 2]
	var dic = {"a": 1}
	var leaf = null

func _initialize():
	var i = Inner.new()
	var di = inst_to_dict(i)
	var b = dict_to_inst(di)
	print("t01|", typeof(b))
	print("t02|", b is Inner)
	print("t03|", b.k, "|", b.s)
	print("t04|", inst_to_dict(b))
	print("t05|", var_to_str(inst_to_dict(b)))
	print("t06|", b == i)
	print("t07|", b.get_instance_id() == i.get_instance_id())
	print("t08|", b is RefCounted)
	print("t09|", inst_to_dict(b).keys())
	var w = WithInit.new()
	var dw = inst_to_dict(w)
	var w2 = dict_to_inst(dw)
	print("t10|", w2.touched)
	print("t11|", w2 is WithInit)
	print("t12|", inst_to_dict(w2))
	print("t13|", dict_to_inst(dw).touched)
	var dv = inst_to_dict(Derived.new())
	dv.erase(&"b")
	var back = dict_to_inst(dv)
	print("t14|", back.a, "|", back.b)
	print("t15|", inst_to_dict(back))
	var full = Box.new()
	var dfull = inst_to_dict(full)
	dfull[&"extra"] = 7
	var rb = dict_to_inst(dfull)
	print("t16|", inst_to_dict(rb))
	print("t17|", rb.arr == full.arr)
	print("t18|", rb.dic == full.dic)
	print("t19|", rb.plain, "|", rb.leaf, "|", rb.arr, "|", rb.dic)
	var a = Acc.new()
	var da = inst_to_dict(a)
	print("t20|", da)
	da[&"v"] = 2
	var ab = dict_to_inst(da)
	print("t21|", ab._v, "|", ab.v)
	print("t22|", inst_to_dict(ab))
	var da2 = inst_to_dict(a)
	da2[&"_v"] = 3
	var ab2 = dict_to_inst(da2)
	print("t23|", ab2._v, "|", ab2.v)
	var ds = {"@path": str(di["@path"]), "@subpath": "Inner", &"k": 5}
	var bs = dict_to_inst(ds)
	print("t24|", bs is Inner)
	print("t25|", bs.k, "|", bs.s)
	print("t26|", inst_to_dict(bs))
	print("t27|", dict_to_inst(inst_to_dict(Empty.new())) is Empty)
	print("t28|", dict_to_inst(di).s)
	di[&"k"] = 8
	print("t29|", b.k, "|", dict_to_inst(di).k)
	quit()
