extends SceneTree

# 实测 Godot 4.6.3：`Cannot include a value of type "String" as "int".`（解析期）
# 同格的 float→int / bool→int 是允许的（083 钉的是运行时截断），只有静态就对不上的族才报错。
func _initialize():
	var a: Array[int] = [1, "s"]
	print(a)
	quit()
