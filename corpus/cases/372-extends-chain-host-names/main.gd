extends "res://mid.gd"

# 实测：`extends` 文件链顶端挂着 SceneTree 的那一份里，宿主裸方法名当值用照样合法（两跳链：main → mid → base，S370）。
var f = quit

var typed: Callable = create_timer

func take(x = quit):
	print("默认实参 → ", typeof(x), " | ", x.get_method())

func _initialize():
	print("字段初值 → ", typeof(f), " | ", f.get_method())
	print("带型字段 → ", typeof(typed), " | ", typed.get_method())
	print("self → ", typeof(self))
	take()
	quit()
