extends SceneTree

# 实测：宿主裸名、`self` 在函数体之外的那些位置（模块字段初值、形参默认值、lambda 体）同样合法（S367）。
var host = quit
var typed: Callable = create_timer
var who = self

func take(x = quit):
	print("形参默认值 → ", typeof(x), " | ", x.get_method())

func takeSelf(x = self):
	print("形参默认值 self → ", typeof(x))

func _initialize():
	print("模块 var → ", typeof(host), " | ", host.get_method(), " | 有效 ", host.is_valid())
	print("带型模块 var → ", typeof(typed), " | ", typed.get_method())
	print("模块 self → ", typeof(who))
	take()
	takeSelf()
	var lam = func():
		return typeof(host)
	print("lambda 体里的宿主名 → ", lam.call())
	for quit in [1, 2]:
		print("同名遮蔽 → ", typeof(quit), " | ", quit)
		break
	quit()
