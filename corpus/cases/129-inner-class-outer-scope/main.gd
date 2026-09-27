extends SceneTree

const TOP: int = 42

enum Suit { HEARTS, SPADES }


class Other:
	const OC: int = 5

	func getoc():
		return OC


class Inner:
	func useconst():
		return TOP

	func useenum():
		return Suit.HEARTS

	func useother():
		return Other.new().getoc()

	func ownconst():
		return IC

	const IC: int = 9


func _initialize():
	var i = Inner.new()
	print("t1 ", i.useconst())
	print("t2 ", i.useenum())
	print("t3 ", i.useother())
	print("t4 ", i.ownconst())
	print("t5 ", Inner.IC)
	quit()
