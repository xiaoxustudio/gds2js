extends SceneTree

class Thing extends RefCounted:
	var a = 7

func _initialize():
	var o = Thing.new()
	print("r ", o.get_class(), " ", o.is_class("RefCounted"), " ", o.is_class("Object"), " ", o.is_class("Thing"), " ", o.is_class("Node"), " ", o.is_class("Nope"))
	quit()
