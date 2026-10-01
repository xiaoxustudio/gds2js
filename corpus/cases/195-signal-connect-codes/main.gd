extends SceneTree

signal fired(a)

func on_fired(v):
	print("got ", v)

func _initialize():
	var s = fired
	print("r1 ", s.connect(on_fired))
	s.emit(1)
	s.disconnect(on_fired)
	print("r2 ", s.connect(on_fired))
	s.disconnect(on_fired)
	print("r3 ", typeof(s.connect(on_fired, 4)))
	s.emit(2)
	s.emit(3)
	print("r4 ", s.connect(on_fired, 1))
	s.emit(4)
	quit()
