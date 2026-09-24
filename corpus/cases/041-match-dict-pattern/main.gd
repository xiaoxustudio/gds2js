extends SceneTree

func _initialize():
	var d = { "a": 1, "b": "two" }
	match d:
		{ "a": 1, "b": "two" }:
			print("exact")
		_:
			print("other")

	var e = { "x": 10, "y": 20 }
	match e:
		{ "x": 10, "y": 99 }:
			print("wrong-val")
		{ "x": _, "y": 20 }:
			print("wild-x")
		_:
			print("e-fallback")

	var n = { "p": [1, 2] }
	match n:
		{ "p": [1, 2] }:
			print("nested-arr")

	var big = { "a": 1, "b": 2, "c": 3 }
	match big:
		{ "a": 1, "b": 2 }:
			print("subset-should-not-run")
		_:
			print("exact-only")
	quit()
