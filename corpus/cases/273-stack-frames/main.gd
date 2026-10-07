extends SceneTree

class Inner extends RefCounted:
	func meth():
		print_stack()

	static func hi():
		print_stack()

class Boot extends RefCounted:
	func _init():
		print_stack()

func deep(tag):
	print_stack()
	print(tag, get_stack())
	print(tag, get_stack().size())

func mid():
	deep("m|")

func lam():
	var f = func(): print_stack()
	f.call()

func rec(n):
	if n <= 0:
		print_stack()
		return
	rec(n - 1)

func _initialize():
	mid()
	lam()
	rec(1)
	Boot.new()
	var i = Inner.new()
	i.meth()
	Inner.hi()
	push_warning("w1", "w2", 5)
	push_error("boom")
	push_error()
	print("z|done")
	quit()
