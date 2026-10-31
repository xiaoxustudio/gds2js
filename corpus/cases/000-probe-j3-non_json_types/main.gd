extends SceneTree

func _initialize():
	print("a|", JSON.stringify(null), "|", JSON.stringify(5), "|", JSON.stringify(true), "|", JSON.stringify("s"))
	print("b|", JSON.stringify([Vector2(1, 2)]), "|", JSON.stringify(Color(1, 0, 0)))
	quit()
