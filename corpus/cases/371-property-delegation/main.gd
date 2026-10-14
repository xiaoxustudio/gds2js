extends SceneTree

# 实测：属性的具名委托与 static 那一维 —— 委托目标按 static / 实例分接收者，带初值的属性留一个后备槽（初值照评、写属性不动槽），static 属性委托到实例方法时那一次调用不发生（S369）。
var store = 0
var side = ""

func tag(t: String) -> Variant:
	side += t
	return 1

func _g() -> Variant:
	return store

func _s(v: Variant) -> void:
	store = v

static func _sg() -> Variant:
	return 7

static func _ss(v: Variant) -> void:
	sstore = v

static var sstore = 2

var named_get: Variant:
	get = _g

var named_set: Variant:
	set = _s

var pair: Variant: get = _g, set = _s

var with_init: Variant = 9:
	set = _s

var inline_init: Variant = 8:
	set(v):
		store = v

var typed_set: int:
	set = _s

var ordered: Variant = tag("t"):
	get = _g

var via_static: Variant:
	get = _sg

static var sinline: Variant:
	get:
		return sstore

static var snamed: Variant: get = _sg, set = _ss

static var sget_dead: Variant:
	get = _g

static var sset_dead: Variant:
	set = _s

func _initialize():
	print("具名 getter → ", typeof(named_get), " | ", named_get)
	store = 3
	print("具名 getter 再读 → ", named_get)
	named_set = 4
	print("具名 setter → 读 ", typeof(named_set), " | 存的 ", store)
	pair = 5
	print("一行并列 → ", pair, " | ", store)
	print("带初值 + 具名 setter → ", typeof(with_init), " | ", with_init)
	with_init = 6
	print("写它之后 → ", with_init, " | 存的 ", store)
	print("带初值 + inline setter → ", typeof(inline_init), " | ", inline_init)
	print("初值副作用与顺序 → ", side)
	print("实例属性委托 static 方法 → ", typeof(via_static), " | ", via_static)
	print("static 属性 inline getter → ", typeof(sinline), " | ", sinline)
	snamed = 10
	print("static 属性具名成对 → ", typeof(snamed), " | ", snamed, " | ", sstore)
	print("static 属性委托实例 getter → ", typeof(sget_dead), " | ", sget_dead)
	sset_dead = 11
	print("static 属性委托实例 setter → 读 ", typeof(sset_dead), " | 存的 ", store)
	print("定型属性只带 setter → ", typeof(typed_set), " | ", typed_set)
	typed_set = 12
	print("写它之后 → ", typeof(typed_set), " | ", typed_set, " | 存的 ", store)
	quit()
