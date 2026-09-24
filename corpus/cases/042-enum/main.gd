extends SceneTree

enum Suit { HEARTS, DIAMONDS = 5, CLUBS }
enum { ANON_A, ANON_B }

func _initialize():
	print(Suit.HEARTS)
	print(Suit.DIAMONDS)
	print(Suit.CLUBS)
	print(Suit.CLUBS + 1)
	print(ANON_A, ANON_B)
	var c = Suit.DIAMONDS
	print(c)
	quit()
