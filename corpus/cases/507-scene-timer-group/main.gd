extends Node

var tick := 0

func _ready():
	var t = get_tree().create_timer(0.05)
	t.timeout.connect(func(): print("to|", tick))
	get_tree().process_frame.connect(func(): print("pf|", tick))
	get_node("P").add_to_group("g")
	get_node("Q").add_to_group("g")
	get_tree().call_group("g", "set_meta", "tag", 7)
	print("g|", get_node("P").get_meta("tag"), "|", get_tree().get_node_count_in_group("g"), "|", get_tree().get_first_node_in_group("g").name)

func _process(_d):
	tick += 1
	if tick == 8:
		print("end|", tick)
		get_tree().quit(0)
