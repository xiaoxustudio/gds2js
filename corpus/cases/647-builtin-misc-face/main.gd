extends SceneTree

func target() -> void:
	pass

func _initialize():
	var a := [3, 1, 2]
	print("p1|", a.pick_random() in [1, 2, 3])
	a.shuffle()
	a.sort()
	print("p2|", a)
	print("c1|", Callable(self, "target").bindv([]).is_valid())
	print("c2|", Callable.create(self, "target").is_valid())
	var d := {1: 2}
	print("d1|", d.get_typed_key_script() == null)
	quit()
