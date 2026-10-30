extends SceneTree

class Named:
	var label = "named"

	func tag():
		return "N:" + label


class Named2 extends Named:
	func tag():
		return "N2/" + super.tag() + "/" + str(label.length())


func _initialize():
	var o = Named2.new()
	print("a|", o.tag(), "|", o.label, "|", o.get_class(), "|", o is Named)
	quit()
