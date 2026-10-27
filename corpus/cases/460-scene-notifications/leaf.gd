extends Node

func _ready():
	print("n|leaf-ready|", get_parent().name, "|", str(self), "|", get_class(), "|", get_index())

func _process(_d):
	print("n|leaf-process|", String(get_path()))

func _exit_tree():
	print("n|leaf-exit|", String(get_path()))
