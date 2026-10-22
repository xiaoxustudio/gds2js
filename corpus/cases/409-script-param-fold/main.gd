extends SceneTree

class Inner:
	func ti(a: int) -> int:
		return a

	func tf(a: float) -> float:
		return a

	func tb(a: bool) -> bool:
		return a

	func ts(a: String) -> String:
		return a

	func tsn(a: StringName) -> StringName:
		return a

	func tv(a: Vector2) -> float:
		return a.x

	func freec(a) -> int:
		return 7

	func dflt(a: int = 3) -> int:
		return a

func _initialize():
	var o: Variant = Inner.new()
	print("A|", o.ti(1.5), "|", o.ti(true), "|", o.ti(false), "|", o.tf(1), "|", o.tf(true), "|", o.tf(1.5))
	print("B|", o.tb(1), "|", o.tb(0), "|", o.tb(1.5), "|", o.tb(0.0), "|", o.ts(&"a"), "|", o.tsn("a"))
	print("C|", o.tv(Vector2(1, 2)), "|", o.freec("anything"), "|", o.freec([1]), "|", o.dflt(), "|", o.dflt(2), "|", o.ti(7))
	var p: Inner = Inner.new()
	print("D|", p.ti(1.5), "|", p.tf(1), "|", p.tb(1), "|", p.ts(&"a"), "|", p.tsn("a"), "|", p.tv(Vector2(3, 4)))
	print("E|", typeof(p.ti(true)), " ", typeof(p.tf(1)), " ", typeof(p.tb(1)), " ", typeof(p.ts(&"a")), " ", typeof(p.tsn("a")))
	print("F|", str(p.dflt()), "|", str(o.ti(-1.7)), "|", str(o.tf(-2)), "|", str(o.tb(-1)), "|", str(o.tb(0.5)))
	quit()
