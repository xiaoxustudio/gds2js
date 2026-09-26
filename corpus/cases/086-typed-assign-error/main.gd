extends SceneTree

# 实测 Godot 4.6.3 运行期：`Trying to assign an array of type "Array" to a variable of type "Array[int]".`
# 判据是「值本身定没定型」—— 未定型的数组即使一个元素都没有也照样报错。
func _initialize():
	print("before")
	var u = []
	var a: Array[int] = u
	print(a)
	quit()
