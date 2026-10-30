extends SceneTree

var first = "F"
var full: String:
	get:
		return first + "-got"

var both: int:
	get:
		return stored
	set(value):
		stored = value + 1

var stored = 7


func _initialize():
	both = 10
	print("a|", full, "|", both, "|", stored)
	quit()
