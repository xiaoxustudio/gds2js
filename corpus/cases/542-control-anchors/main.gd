extends Control
func _ready():
	size = Vector2(800, 600)
	var c := Control.new()
	c.name = "C"
	add_child(c)
	c.position = Vector2(10, 20)
	c.size = Vector2(100, 50)
	print("a0|", c.anchor_left, "|", c.anchor_top, "|", c.anchor_right, "|", c.anchor_bottom)
	print("o0|", c.offset_left, "|", c.offset_top, "|", c.offset_right, "|", c.offset_bottom)
	c.anchor_right = 1
	c.anchor_bottom = 1
	print("a1|", c.anchor_right, "|", c.anchor_bottom, "|", c.position, "|", c.size)
	print("o1|", c.offset_left, "|", c.offset_top, "|", c.offset_right, "|", c.offset_bottom)
	c.offset_right = -10
	print("o2|", c.position, "|", c.size)
	get_tree().quit(0)
