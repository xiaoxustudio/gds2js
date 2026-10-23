extends SceneTree

func _initialize():
	for subj in [1, 2, 5]:
		match subj:
			1 if true else 2:
				print(subj, "|arm")
			_:
				print(subj, "|default")
	match 1:
		(1 if true else 2):
			print("nested|arm")
		_:
			print("nested|default")
	match 2:
		(2 if false else 1) if true else 3:
			print("deep|arm")
		_:
			print("deep|default")
	quit()
