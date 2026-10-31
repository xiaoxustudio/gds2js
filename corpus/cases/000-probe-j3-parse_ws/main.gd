extends SceneTree

func _initialize():
	print("a|", JSON.parse_string('  {  "a" : [ 1 , 2 ]  }  '))
	quit()
