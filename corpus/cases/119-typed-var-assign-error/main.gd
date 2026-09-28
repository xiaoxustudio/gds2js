extends SceneTree

var mi: int = 1
var ms: String = "a"
var mf: float = 1
var mb: bool = false

func _initialize():
	mi = "s"
	mi = null
	ms = 5
	ms = 1.5
	ms = true
	ms = null
	mf = null
	mb = null
	print("z1 ", mi)
	quit()
