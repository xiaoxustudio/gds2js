extends Node

func _enter_tree():
	print("n|kid-enter|", get_name(), "|", String(get_path()), "|", get_child_count(), "|", get_parent().name)

func _ready():
	print("n|kid-ready|", get_child_count(), "|", has_node("G1"), "|", str(get_node("G1")))

func _process(_d):
	print("n|kid-process|", get_index(), "|", get_node_or_null("nope") == null)

func _exit_tree():
	print("n|kid-exit|", get_name())
