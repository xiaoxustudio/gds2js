extends SceneTree

var fs: String = "%d"
var snq: StringName = &"%q"
var vt: Array = [1, 2]
var vs: String = "ab"

func _initialize():
	print("A ", fs % vs)
	print("B ", "%d" % vt)
	print("C ", snq % 7)
	print("D ", "%q" % vs)
	print("E ", fs % 7)
	quit()
