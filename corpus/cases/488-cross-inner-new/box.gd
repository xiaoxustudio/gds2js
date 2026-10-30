class Box:
	var v = 1

	func bump():
		v += 1
		return v


static func make():
	return Box.new()
