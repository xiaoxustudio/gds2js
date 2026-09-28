extends SceneTree

var mt: int = 2
var mfl: float = 1
var mb: bool = false
var ms: String = "a"
var mv: Vector2 = Vector2(0, 0)

func _initialize():
	mt = 2.7
	print("q1 ", mt)
	var u = 3.9
	mt = u
	print("q2 ", mt)
	mt = true
	print("q3 ", mt)
	mv = Vector2i(1, 2)
	print("q4 ", mv)
	mfl = 5
	print("q5 ", mfl)
	mb = 0
	print("q6 ", mb)
	mb = 3
	print("q7 ", mb)
	ms = &"strname"
	print("q8 ", ms, " ", typeof(ms))
	var li: int = 0
	li = 7.5
	print("q9 ", li)
	li += 0.5
	print("q10 ", li)
	quit()
