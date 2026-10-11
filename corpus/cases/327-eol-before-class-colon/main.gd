extends SceneTree

class Inner extends RefCounted
:
	var a = 1

func _initialize():
	print(Inner.new().a)
	quit()
