extends SceneTree

func _initialize():
	print("a|", JSON.stringify([self]))
	print("b|", JSON.stringify({"k": null}))
	quit()
