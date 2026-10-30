extends SceneTree

class Outer:
	class Middle:
		class Inner:
			var depth = "3"

			func tag():
				return "inner-" + depth

		var mid = "2"

		func tag():
			return "middle-" + Inner.new().tag()

	func tag():
		return "outer-" + Middle.new().tag()


func _initialize():
	var o = Outer.new()
	print("a|", o.tag(), "|", o.Middle.new().tag())
	quit()
