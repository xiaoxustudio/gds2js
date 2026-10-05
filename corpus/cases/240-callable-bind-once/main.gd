extends SceneTree

class Base extends RefCounted:
	func three(a, b, c):
		return str(a, b, c)

	static func stwo(a, b):
		return str(a, b)

func _initialize():
	var o = Base.new()
	var lam = func (x): return x + 1
	print("b01|", o.three.bind() == o.three, "|", o.three.bind() == o.three.bind())
	print("b02|", o.three.bind(1) == o.three.bind(2), "|", o.three.bind(1) == o.three)
	print("b03|", abs.bind() == abs, "|", abs.bind() == abs.bind())
	print("b04|", abs.bind() == Callable(), "|", abs == Callable())
	print("b05|", lam.bind() == lam, "|", lam == lam)
	print("b06|", o.three.bind().get_bound_arguments(), "|", o.three.bind().get_bound_arguments_count())
	print("b07|", o.three.bind().is_null(), "|", o.three.bind().is_valid())
	print("b08|", o.three.bind().call(1, 2, 3))
	print("b09|", o.stwo.bind() == o.stwo, "|", o.stwo.bind().call(1, 2))
	print("b10|", {o.three: 1}.has(o.three.bind()), "|", {o.three: 1}.has(o.three))
	print("b11|", {abs: 1}.has(abs.bind()), "|", {abs: 1}.has(abs.bind(1)))
	print("b12|", o.three.bind().callv([1, 2, 3]), "|", abs.bind().call(-7))
	print("b13|", o.three.bind().get_method(), "|", typeof(o.three.bind().get_method()))
	print("b14|", abs.get_method(), "|", typeof(abs.get_method()), "|", abs.get_method() == &"abs")
	print("b15|", lam.get_method(), "|", typeof(lam.get_method()))
	print("b16|", Callable().get_method(), "|", typeof(Callable().get_method()), "|", Callable().get_method() == "")
	print("b17|", o.three.get_method(), "|", typeof(o.three.get_method()))
	print("b18|", len.get_method(), "|", typeof(len.get_method()))
	print("b19|", o.three.bind().get_argument_count(), "|", abs.get_argument_count(), "|", lam.get_argument_count())
	quit()
