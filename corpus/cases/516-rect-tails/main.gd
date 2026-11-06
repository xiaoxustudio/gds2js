extends SceneTree
func _initialize():
	var a := Rect2(1, 2, 3, 4)
	print("area|", a.has_area(), "|", Rect2(1, 2, 0, 4).has_area())
	print("inter|", a.intersection(Rect2(3, 4, 5, 6)), "|", a.intersection(Rect2(10, 10, 1, 1)))
	print("sup|", a.get_support(Vector2(1, 1)), "|", a.get_support(Vector2(-1, 1)))
	var b := Rect2i(1, 2, 3, 4)
	print("iarea|", b.has_area(), "|", b.intersection(Rect2i(3, 4, 5, 6)), "|", b.intersection(Rect2i(10, 10, 1, 1)))
	quit()
