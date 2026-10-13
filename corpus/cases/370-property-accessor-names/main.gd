extends SceneTree

# 实测：inline 读写器体里引擎照样查名字 —— 宿主裸名、全局函数名、self 都当值用，只带 set 的属性读出来是 null，写只带 get 的属性静默无操作（S368）。
var host = quit
var s1 = 0
var s2 = 0
var s3 = 0

var got: Variant:
	get:
		return host

var fn: Variant:
	get:
		return abs

var me: Variant:
	get:
		return self

var setter_only: Variant:
	set(v):
		s1 = v

var both: Variant:
	get:
		return s2
	set(v):
		s2 = v

var readonly: Variant:
	get:
		return 3

var shadowed: Variant:
	set(quit):
		s3 = quit

func _initialize():
	print("getter 里的宿主名 → ", typeof(got), " | ", got.get_method())
	print("getter 里的全局函数名 → ", typeof(fn), " | ", fn.get_method())
	print("getter 里的 self → ", typeof(me))
	setter_only = 7
	print("只带 set → 读 ", typeof(setter_only), " | 写过的值 ", s1)
	both = 8
	print("读写器成对 → ", typeof(both), " | ", both)
	readonly = 5
	print("只带 get 被写 → ", typeof(readonly), " | ", readonly)
	shadowed = 11
	print("setter 形参盖住同名 → ", typeof(s3), " | ", s3)
	quit()
