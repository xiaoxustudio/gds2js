extends SceneTree

func enc(tag, v):
	print(tag, "e|", var_to_bytes_with_objects(v))

func dec(tag, v):
	var b = var_to_bytes_with_objects(v)
	var r = bytes_to_var_with_objects(b)
	print(tag, "d|", typeof(r), "|", str(r))

func one(tag, v):
	enc(tag, v)
	dec(tag, v)

func _initialize():
	var B = load("res://box.gd")
	var O = load("res://outer.gd")
	var b1 = B.new()
	var b2 = B.new()
	var root = O.new()
	one("t01|", b1)
	one("t02|", b2)
	one("t03|", [b1, b2])
	one("t04|", [b1, b1])
	one("t05|", { "k": b1 })
	one("t06|", root)
	one("t07|", 5)
	one("t08|", "s")
	one("t09|", [1, 2])
	print("t12|", bytes_to_var_with_objects(var_to_bytes_with_objects(b1)).get("n"))
	print("t13|", bytes_to_var_with_objects(var_to_bytes_with_objects(b1)) == b1)
	print("t14|", typeof(bytes_to_var_with_objects(var_to_bytes(b1))), "|", str(bytes_to_var_with_objects(var_to_bytes(b1))))
	print("t16|", var_to_bytes_with_objects(bytes_to_var_with_objects(var_to_bytes_with_objects(b1))) == var_to_bytes_with_objects(b1))
	print("t17|", bytes_to_var_with_objects(var_to_bytes_with_objects([b1, b2]))[0] == b1)
	print("t18|", bytes_to_var_with_objects(var_to_bytes_with_objects({ "k": b1 }))["k"].get("n"))
	quit()
