extends SceneTree

func _initialize():
	var p = PackedInt32Array([1])
	p.append("a")
	p.get("a")
	p.set("a", 1)
	p.find(1, "a")
	p.bsearch(1, "a")
	p.resize("a")
	p.slice("a")
	p.remove_at("a")
	PackedStringArray(["a"]).append(1)
	PackedVector2Array([Vector2(1, 2)]).erase(1)
	quit()
