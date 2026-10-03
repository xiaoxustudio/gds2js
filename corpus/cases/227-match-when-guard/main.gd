extends SceneTree

func g(name: String, cond: bool) -> bool:
	print("guard:" + name)
	return cond

const LIMIT := 3

func pick(v, label: String):
	print("PICK " + label + " " + str(v))
	match v:
		1 when g("a", true):
			print("  hit a")
		2 when g("b", false):
			print("  hit b-guarded")
		2:
			print("  hit b-plain")
		3 when g("c", true):
			print("  hit c")
		_:
			print("  hit wildcard")
	print("  end " + label)

func comma(v, label: String):
	match v:
		1, 2, 3 when g("comma", true):
			print("  " + label + " low")
		4, 5 when g("comma2", false):
			print("  " + label + " mid")
		6, 7 when g("comma3", true):
			print("  " + label + " third")
		_:
			print("  " + label + " rest")

func only_guards(v, label: String):
	match v:
		1 when g("o1", false):
			print("  " + label + " one")
		2 when g("o2", false):
			print("  " + label + " two")
	print("  " + label + " fallen through")

func guard_and(v, label: String):
	match v:
		_ when g("ga", true) and g("gb", false):
			print("  " + label + " both")
		_ when g("gc", true):
			print("  " + label + " third")

func outer_locals(v, label: String):
	var lo = 2
	match v:
		lo when g("ol1", true):
			print("  " + label + " matched-outer-var")
		LIMIT when g("ol2", true):
			print("  " + label + " matched-const")
		_ when lo == 2:
			print("  " + label + " guard-sees-outer")

func container_guards(v, label: String):
	match v:
		[_, _] when g("cg1", false):
			print("  " + label + " pair-no")
		[_, _] when g("cg2", true):
			print("  " + label + " pair-yes")
		{"k": _} when g("cg3", true):
			print("  " + label + " dict")
		_:
			print("  " + label + " other")

func guard_sees_outer_bind(v, label: String):
	var part = 5
	match v:
		part when g("osb", true):
			print("  " + label + " outer-bind")
		_ when part > 4:
			print("  " + label + " outer-guard-uses-bind")

func _initialize():
	pick(1, "v1")
	pick(2, "v2")
	pick(3, "v3")
	pick(9, "v9")
	comma(2, "cm2")
	comma(4, "cm4")
	comma(6, "cm6")
	comma(7, "cm7")
	comma(99, "cm99")
	only_guards(1, "og1")
	only_guards(2, "og2")
	only_guards(3, "og3")
	guard_and(0, "ga")
	outer_locals(2, "ol2")
	outer_locals(3, "ol3")
	outer_locals(8, "ol8")
	container_guards([1, 2], "cg-list")
	container_guards({"k": 1}, "cg-dict")
	container_guards(7, "cg-other")
	guard_sees_outer_bind(5, "osb5")
	guard_sees_outer_bind(6, "osb6")
	quit()
