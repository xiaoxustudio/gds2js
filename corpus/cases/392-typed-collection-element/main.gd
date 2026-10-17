extends SceneTree

var q1: Array[int] = ["a", "b"]
var q2: Dictionary[String, int] = {"k": "s", "j": "x"}
var q3: Dictionary[String, int] = {1: 2}
var q4: Array[Vector2] = [1, "s"]
var q5: Array[int] = [1, 2, "s"]
var q6: Array[int] = [1, 2]
var q7: Dictionary[String, int] = {"k": 1}

func f1(a: Array[int] = ["x", "y"]):
	pass

func f2(a: Dictionary[String, int] = {1: 2}):
	pass

func _initialize():
	print(q6, q7)
	quit()
