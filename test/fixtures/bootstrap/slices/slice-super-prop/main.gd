extends SceneTree

class Base:
	var tag = "base-tag"
	var hits = 0

	func read():
		return tag

	func bump():
		hits += 1
		return hits


class Child extends Base:
	func read():
		return "child/" + super.tag

	func bump():
		var n = super.bump()
		super.tag = "mutated"
		return n + 100


func _initialize():
	var c = Child.new()
	print("a|", c.read(), "|", c.bump(), "|", c.tag, "|", c.hits, "|", super_eq(c))


func super_eq(c):
	return str(c.read() == "child/mutated")
