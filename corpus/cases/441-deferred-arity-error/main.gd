extends SceneTree

func notify(x):
	print("N ", x)

func _initialize():
	notify.call_deferred()
	notify.call_deferred(7, 8)
	print("A")
	quit()
