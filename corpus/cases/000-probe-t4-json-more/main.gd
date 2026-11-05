extends SceneTree

func _initialize():
	print("a|", JSON.stringify(NAN))
	print("b|", JSON.stringify(INF))
	print("c|", JSON.stringify(-INF))
	var j := JSON.new()
	print("d|", j.parse("{\"a\":1}", true), "|", j.get_data())
	var k := JSON.new()
	print("e|", k.parse("bad", true), "|", k.get_error_message())
	quit()
