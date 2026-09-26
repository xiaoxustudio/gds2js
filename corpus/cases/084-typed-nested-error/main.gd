extends SceneTree

# 实测 Godot 4.6.3：`Nested typed collections are not supported.`（解析期）
func _initialize():
	var a: Array[Array[int]] = []
	print(a)
	quit()
