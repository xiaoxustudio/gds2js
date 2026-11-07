extends SceneTree

func probe(s):
	print(s)
	return 1

var A = probe("A") + B
var B = probe("B")

func _initialize():
	print(A, B)
	quit()
