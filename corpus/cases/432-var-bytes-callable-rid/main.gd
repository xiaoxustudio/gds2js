extends SceneTree

class Holder:
	var tag = 1
	func call_me(x):
		return x

func _initialize():
	var h = Holder.new()
	var f = func(x): return x
	print(var_to_bytes(Callable(abs)))
	print(var_to_bytes(h.call_me))
	print(var_to_bytes_with_objects(f))
	print(var_to_bytes(rid_from_int64(0)))
	print(var_to_bytes(rid_from_int64(13241)))
	print(var_to_bytes({"c": Callable(abs)}))
	var d = bytes_to_var(var_to_bytes(Callable(abs)))
	print(typeof(d), " ", d.is_valid())
	print(typeof(bytes_to_var(var_to_bytes(rid_from_int64(0)))))
	quit()
