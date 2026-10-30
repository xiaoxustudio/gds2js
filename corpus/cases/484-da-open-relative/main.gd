extends SceneTree

func _initialize():
	var dot = DirAccess.open(".")
	print("a|", dot != null, "|", dot.get_current_dir())
	var up = DirAccess.open("..")
	print("b|", up != null, "|", up.get_current_dir() != dot.get_current_dir())
	print("c|", dot.dir_exists("here"), "|", dot.file_exists("main.gd"))
	print("d|", dot.change_dir("here"), "|", dot.get_current_dir(), "|", dot.file_exists("a.txt"))
	var user = DirAccess.open("user://")
	print("e|", user.get_current_dir(), "|", user.dir_exists("here"))
	print("f|", dot.get_current_dir() == user.get_current_dir())
	print("g|", DirAccess.open("./sub") != null)
	quit()
