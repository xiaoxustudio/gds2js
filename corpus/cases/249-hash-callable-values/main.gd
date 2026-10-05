extends SceneTree

func _initialize():
	print("k01|", hash(abs), "|", hash(sign), "|", hash(len), "|", hash(str))
	print("k02|", hash(range), "|", hash(load), "|", hash(print), "|", hash(str_to_var))
	print("k03|", hash(Callable()), "|", hash(abs) == hash(Callable(abs)))
	print("k04|", hash(abs) == hash("abs"), "|", hash(len) == hash(&"len"))
	print("k05|", typeof(hash(abs)), "|", hash(abs) > 0, "|", hash(var_to_str) == hash("var_to_str"))
	print("k06|", hash(type_convert), "|", hash(convert), "|", hash(floor), "|", hash(ceil))
	print("k07|", hash(max), "|", hash(min), "|", hash(sqrt), "|", hash(hash))
	var d = {}
	d[abs] = 1
	d[str] = 2
	print("k08|", d.size(), "|", d.has(abs), "|", d[str])
	print("k09|", hash(abs) == hash(sign), "|", hash(str) == hash(str_to_var))
	quit()
