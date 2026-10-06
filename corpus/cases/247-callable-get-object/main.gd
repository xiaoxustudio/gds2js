extends SceneTree

class Inner extends RefCounted:
	var v = 7

	func m(x):
		return x + v

	static func sstat(x):
		return x

func top(x):
	return x

func _initialize():
	var o = Inner.new()
	var cm = o.m
	print("q01|", typeof(cm.get_object()), "|", cm.get_object() == o, "|", cm.get_object().v)
	var other = Inner.new()
	print("q02|", cm.get_object() == other, "|", cm.get_object() == o)
	print("q03|", cm.get_object().get_instance_id() == o.get_instance_id())
	var ct = top
	print("q04|", typeof(ct.get_object()), "|", ct.get_object() == self)
	var cs = Inner.sstat
	print("q05|", typeof(cs.get_object()), "|", cs.get_object() == Inner, "|", cs.get_object() == o)
	var b = cm.bind(1)
	print("q06|", b.get_object() == o, "|", b.get_object().v)
	print("q07|", str(cm.get_object().get_class()), "|", cm.get_object() == cm.get_object())
	print("q08|", cm.get_object() == ct.get_object())
	print("q09|", cm.get_object().m(1), "|", cs.get_object().sstat(2))
	quit()
