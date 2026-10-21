extends SceneTree

func takes3(v: Array[RefCounted]) -> void:
	pass

func takes4(v: Array[String]) -> void:
	pass

func _initialize():
	var h: Array[String] = ["a"]
	takes3(h)
	var ai: Array[int] = [1]
	takes4(ai)
	var d1: Dictionary[int, String] = {1: "a"}
	var d2: Dictionary[String, int] = d1
	quit()
