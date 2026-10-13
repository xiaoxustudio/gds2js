extends SceneTree

# 实测：宿主基类（SceneTree）与 Object 的方法名可以裸当值用，给的是 typeof 25 的 Callable（S358）。
func zz():
	return 7

func take(f: Callable):
	print("T|", f.is_valid(), "|", f.get_method())

func _initialize():
	var c: Variant = quit
	print("A|", typeof(c), "|", c.get_method(), "|", c.is_valid())
	take(quit)
	var z: Variant = zz
	print("B|", typeof(z), "|", z.call())
	var g: Variant = get_class
	print("C|", typeof(g), "|", g.call())
	var k: Variant = [quit, zz]
	print("D|", k, "|", k[1].call())
	quit()
