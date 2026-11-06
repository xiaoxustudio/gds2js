extends Node2D

var tick := 0

func _ready():
	var tw = create_tween()
	tw.tween_property(self, "position", Vector2(120, 60), 0.1)
	tw.finished.connect(func(): print("fin|", position))

func _process(_d):
	tick += 1
	print(tick, "|", position)
	if tick == 12:
		get_tree().quit(0)
