class_name Builder

func make_pair(a, b):
	return { "x": a, "y": b }

func describe(d):
	return "%s/%s" % [d["x"], d["y"]]
