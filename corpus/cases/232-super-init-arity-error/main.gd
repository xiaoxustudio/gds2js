extends RefCounted

class Parent2 extends RefCounted:
	func _init(_a, _b):
		pass

class TooFew extends Parent2:
	func _init():
		super(1)

class TooMany extends Parent2:
	func _init():
		super(1, 2, 3)
