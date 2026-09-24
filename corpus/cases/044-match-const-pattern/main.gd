extends SceneTree

const LIMIT = 3
enum State { IDLE, RUN = 4, JUMP }

func _initialize():
	match 3:
		LIMIT:
			print("limit")
		_:
			print("other")

	match 4:
		State.RUN:
			print("run")
		State.IDLE:
			print("idle")
		_:
			print("s-other")

	match State.JUMP:
		State.IDLE:
			print("wrong")
		State.JUMP:
			print("jump")
	quit()
