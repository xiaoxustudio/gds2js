extends SceneTree

signal fired(a)

func on_fired(v):
	print("got ", v)

func on_other(v):
	print("other ", v)

func _initialize():
	var s = fired
	print("r1 ", s.connect(on_fired))
	s.emit(1)
	s.disconnect(on_fired)
	print("r2 ", s.connect(on_fired))
	s.disconnect(on_fired)
	print("r3 ", typeof(s.connect(on_fired, CONNECT_ONE_SHOT)))
	s.emit(2)
	s.emit(3)
	print("r4 ", s.connect(on_other, CONNECT_REFERENCE_COUNTED))
	print("r5 ", s.connect(on_other, CONNECT_REFERENCE_COUNTED))
	s.emit(4)
	quit()
