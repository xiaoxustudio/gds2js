extends SceneTree

# 实测：读得到的名字（全局函数名 / 引擎类名 / 宿主基类方法名）都写不得，引擎给的是常量那一句解析期拒。
func _initialize():
	quit = 5
	print("A|ok")
	quit()
