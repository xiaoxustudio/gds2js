extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	print("a|", d.make_dir("k1"), "|", DirAccess.make_dir_recursive_absolute("user://k2/k3"))
	print("b|", d.copy("seed.txt", "k1/seed.txt"), "|", d.rename("k1/seed.txt", "k1/moved.txt"))
	print("c|", d.remove("k1/moved.txt"), "|", d.remove("k1/gone.txt"), "|", d.file_exists("k1/gone.txt"))
	print("d|", d.dir_exists("k2/k3"), "|", d.get_relative_path("user://k2/k3", "user://k2"))
	print("e|", d.change_dir("k2"), "|", d.get_current_dir())
	quit()
