extends SceneTree

var c: Color = Color(0.1, 0.2, 0.3, 0.4)
var q: Color

func poke(p: Color):
	p.r = 9.0
	print(p)

func _initialize():
	print(typeof(c), " ", Color(), " ", Color(1, 2, 3), " ", Color(1, 2, 3, 4), " ", Color(c), " ", q)
	print(Color("red"), " ", Color("#00ff00"), " ", Color("FF8000"), " ", Color("f00"), " ", Color("REBECCA_PURPLE"), " ", Color("medium_purple"))
	print(Color.html("80ff0000"), " ", Color.html("f00"), " ", Color.from_string("#00ff00", Color(9, 9, 9, 9)), " ", Color.from_string("alice_blue", Color(9, 9, 9, 9)))
	print(Color.from_hsv(0.5, 0.25, 0.5), " ", Color.from_hsv(1, 1, 1), " ", Color.from_hsv(0, 0, 0), " ", Color.from_hsv(0.5, 0.25, 0.5, 0.125))
	print(Color.RED, " ", Color.ALICE_BLUE, " ", Color.TRANSPARENT, " ", Color.MEDIUM_PURPLE, " ", Color.REBECCA_PURPLE)
	print(Color(1.0 / 3.0, 0.1, 0.123456789, 1.0), " ", Color(1.0 / 3.0, 1e-5, -1e-5, -0.0))
	print(Color(1e20, 1e-8, -1e-8, 1), " ", Color(0.0 / 0.0, 1.0 / 0.0, -1.0 / 0.0, 1), " ", Color(0.9999999, 0.00004, 0.00006, 0.5))
	print(c.r, " ", c.g, " ", c[0], " ", c["g"], " ", c.a, " ", c[3])
	print(c.h, " ", c.s, " ", c.v, " ", c["h"], " ", c.r8, " ", c.a8)
	print(Color(0.5, 0.5, 0.5).h, " ", Color(0.5, 0.5, 0.5).s, " ", Color(0, 0, 0).h, " ", Color(-0.5, 0.2, 0.9).h, " ", Color(0.2, 0.1, 0.3).h)
	print(Color(0.6, 0.4, 0.2, 1).h, " ", Color(0.6, 0.4, 0.2, 1).s, " ", Color(0.6, 0.4, 0.2, 1).v, " ", Color(0.0 / 0.0, 1.0 / 0.0, -1.0 / 0.0, 0.4).r8)
	var d = Color(c)
	d.b = 1
	print(c, " | ", d)
	poke(Color(0.1, 0.2, 0.3, 0.4))
	print(c, " ", Color(1, 2, 3, 4) + Color(0.5, 0.5, 0.5, 0.5), " ", Color(1, 2, 3, 4) - Color(0.5, 0.5, 0.5, 0.5))
	print(Color(1, 2, 3, 4) * Color(2, 3, 4, 5), " ", Color(1, 2, 3, 4) * 2, " ", 2 * Color(1, 2, 3, 4))
	print(Color(1, 2, 3, 4) / 2, " ", Color(1, 2, 3, 4) / Color(2, 4, 6, 8), " ", Color(1, 2, 3, 4) / 0.0)
	print(-Color(1, -2, 0, 0.5), " ", Color(1, 2, 3, 4) == Color(1, 2, 3, 4.0), " ", Color(1, 2, 3, 4) == null)
	print(Color(0.6, 0.4, 0.2, 1).to_html(), " ", Color(0.25, 0.5, 0.75, 0.5).to_html(true), " ", Color(0.25, 0.5, 0.75, 0.5).to_html(false))
	print(Color(0.4, 0.5, 0.6, 0.7).to_html(true), " ", Color(1, 1, 1, 1).to_rgba32(), " ", Color(0, 0, 0, 0).to_rgba32())
	print(Color(0.6, 0.4, 0.2, 1).to_rgba32(), " ", Color(0.6, 0.4, 0.2, 1).to_argb32(), " ", Color(0.6, 0.4, 0.2, 1).to_abgr32())
	print(Color(0.5, 0.5, 0.5).get_luminance(), " ", Color(0.25, 0.5, 0.75).get_luminance(), " ", Color(0.6, 0.4, 0.2, 1).get_luminance())
	print(Color(0.6, 0.4, 0.2, 0.3).lightened(0.5), " ", Color(0.6, 0.4, 0.2, 0.3).darkened(0.5), " ", Color(1, 1, 1, 1).lightened(0.5))
	print(Color(0.6, 0.4, 0.2, 1).lightened(-0.5), " ", Color(0.6, 0.4, 0.2, 1).darkened(-0.5))
	print(Color(0.6, 0.4, 0.2, 0.3).inverted(), " ", Color(0.1, 0.2, 0.3, 0.4).lerp(Color(0.7, 0.8, 0.9, 1.0), 0.333))
	print(Color(1, 2, 3, 4).is_equal_approx(Color(1.000009, 2, 3, 4)), " ", Color(1, 2, 3, 4).is_equal_approx(Color(1.00001, 2, 3, 4)))
	var e = Color(0.1, 0.2, 0.3, 0.4)
	e.h = 0.5
	print(e)
	var f = Color(0.1, 0.2, 0.3, 0.4)
	f.s = 0.5
	print(f)
	var g = Color(0.1, 0.2, 0.3, 0.4)
	g["v"] = 0.5
	print(g)
	var k = Color(0.1, 0.2, 0.3, 0.4)
	k.r8 = 128
	print(k, " ", k.r, " ", k.h, " ", k.a8)
	var m = Color(0.1, 0.2, 0.3, 0.4)
	m["a"] = 0.5
	m[3] = 0.25
	print(m)
	var key = Color(1, 0, 0, 1)
	var dd = { key: 7 }
	key.b = 1
	print(dd, " ", dd.has(key), " ", dd.has(Color(1, 0, 0, 1)), " ", dd[Color(1, 0, 0, 1)])
	var ta: Array[Color] = [Color(1, 0, 0, 1)]
	ta.resize(3)
	print(ta, " ", ta[0] == Color(1, 0, 0, 1), " ", ta.has(Color(0, 0, 0, 1)))
	ta[0].g = 0.5
	print(ta)
	quit()
