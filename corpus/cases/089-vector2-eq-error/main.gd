extends SceneTree

# 实测：Vector2 与数字/字符串/容器比 `==` / `!=` 都是运行时报错（只有跟 null 比给 false）。
func _initialize():
	print("before")
	var v = Vector2(1, 2)
	print(v == 3)
	quit()
