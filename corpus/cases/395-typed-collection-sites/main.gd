extends SceneTree

class Inner:
	pass

var q1: Array[int] = [1]
var q2: Array[Inner] = [1]

func g(a: Array[int]):
	pass

func r1() -> Array[int]:
	return ["s"]

func r2() -> Dictionary[String, int]:
	return {"k": "s"}

func _initialize():
	g(["s"])
	q1 = ["s"]
	print(q1, q2)
	quit()
