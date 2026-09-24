extends SceneTree

enum Suit { HEARTS, DIAMONDS = 5, CLUBS }

func _initialize():
	print(Suit.size())
	print(Suit.keys())
	print(Suit.values())
	print(Suit["DIAMONDS"])
	print(Suit.has("CLUBS"))
	print(Suit.has("NOPE"))
	for k in Suit:
		print(k)
	print(Suit)
	quit()
