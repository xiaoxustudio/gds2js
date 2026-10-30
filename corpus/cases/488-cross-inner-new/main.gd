extends SceneTree

const B = preload("res://box.gd")


func _initialize():
	var b = B.Box.new()
	print("a|", b.v, "|", b.bump(), "|", b.v)
	var m = B.make()
	print("b|", m.v, "|", m.bump())
	print("c|", B.Box.new().v, "|", b is Object)
	quit()
