extends SceneTree

class Base extends RefCounted:
	var two = 2
	var holder = "{three}"

class Kid extends Base:
	var three = 3
	var back = "{two}"

class Thing extends RefCounted:
	var alpha = 1
	var beta = 9
	var note = "{beta}"
	var twice = "A{alpha}B{alpha}C"
	var lower = 5
	var deep = {"k": [1, {"m": 2}]}
	var f = 2.5
	var s = "a\nb"

func _initialize():
	var o = Thing.new()
	print("p01|", "{alpha}".format(o))
	print("p02|", "{alpha}{alpha}".format(o), "|", "{twice}".format(o))
	print("p03|", "{note} {beta}".format(o), "|", "{beta} {note}".format(o))
	print("p04|", "{Lower}|{lower}".format(o))
	print("p05|", "{deep}".format(o))
	print("p06|", "{alpha}".format(o) == "1")
	print("p07|", "{f}|{s}|{alpha}".format(o))
	var k = Kid.new()
	print("p08|", "{holder}|{three}|{two}".format(k))
	print("p09|", "{holder}{back}".format(k), "|", "{back}".format(k))
	print("p10|", "{one}|{two}|{three}".format(k))
	print("p11|", "{_}={_}".format(k), "|", "{}".format(k))
	print("p12|", "{alpha}".format([1, 2]), "|", "{0}".format(o))
	print("p13|", "{missing}|{alpha}".format(o))
	print("p14|", "x{alpha}x".format(o, "{0}"), "|", "{alpha}".format(o, "{}"))
	quit()
