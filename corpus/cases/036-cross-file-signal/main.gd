extends SceneTree

func _initialize():
	var n = Notifier.new()
	n.ping.connect(_on)
	n.fire(42)
	quit()

func _on(v):
	print("got ", v)
