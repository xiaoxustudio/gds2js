extends SceneTree

class Box:
	var n = 1

func head(tag, v):
	var b = var_to_bytes(v)
	print(tag, "sz|", b.size(), "|", b.slice(0, 4))

func show(tag, v):
	print(tag, "t|", typeof(v), "|", str(v))

func _initialize():
	var a = Box.new()
	var c = Box.new()
	head("h01|", a)
	head("h02|", [a, c])
	head("h03|", { "k": a })
	head("h04|", [a])
	show("s01|", bytes_to_var(var_to_bytes(a)))
	show("s02|", bytes_to_var(var_to_bytes(a)) == bytes_to_var(var_to_bytes(a)))
	show("s03|", a == a)
	var box = bytes_to_var(var_to_bytes(a))
	show("s04|", box.get_object_id() == a.get_instance_id())
	show("s05|", box.get_object_id() == c.get_instance_id())
	show("s07|", bytes_to_var(var_to_bytes([a]))[0])
	show("s08|", bytes_to_var(var_to_bytes({ "k": a }))["k"])
	quit()
