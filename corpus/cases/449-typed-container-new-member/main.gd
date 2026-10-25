extends SceneTree

func _init():
	var a: Array[int] = [1]
	print(a.new)
	var d: Dictionary[int,String] = {1: "x"}
	print(d.new)
	var aa: Array[Vector2] = [Vector2(1, 2)]
	print(aa[0].new)
	quit()
