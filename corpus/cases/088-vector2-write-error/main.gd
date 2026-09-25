extends SceneTree

# 实测：向量分量只收 int/float —— `v.x = true` / `= "s"` / `= Vector2(...)` 都是运行时报错，
# 不是截断；未知属性名（`v.zz = 1`）与越界下标（`v[2]`、`v[-1]`）同样报错。
func _initialize():
	print("before")
	var v = Vector2(1, 2)
	v.y = "s"
	print(v)
	quit()
