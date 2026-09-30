extends SceneTree

class A extends RefCounted:
	func p(a: int) -> String:
		return "ok<-" + str(a)

func _initialize():
	var s = "12abc"
	print("t1 ", A.new().p(s))
	print("t2 不该到这里")
	quit()
