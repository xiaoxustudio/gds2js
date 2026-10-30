extends SceneTree

func _initialize():
	var r = RegEx.new()
	print("k01|", r != null, "|", typeof(r), "|", r.get_class(), "|", r is RegEx, "|", r is RefCounted, "|", r is Object, "|", r.is_class("RegEx"), "|", r.is_valid(), "|", r.get_pattern())
	print("k02|", r.compile("(\\w+)@(\\w+)"), "|", r.is_valid(), "|", r.get_pattern(), "|", r.get_names(), "|", r.get_group_count())
	var v := "mail bob@site x"
	var s = r.search(v)
	print("k03|", s != null, "|", typeof(s), "|", s.get_class(), "|", s is RegExMatch, "|", s is RefCounted, "|", s.is_class("RegEx"), "|", s.get_group_count())
	print("k04|", s.get_start(), "|", s.get_end(), "|", s.get_string(), "|", s.get_strings(), "|", s.get_subject())
	print("k05|", s.get_start(1), "|", s.get_end(1), "|", s.get_string(1), "|", s.get_start(2), "|", s.get_end(2), "|", s.get_string(2), "|", s.get_string(3), "|", s.get_start(7), "|", s.get_end(7))
	print("k06|", s.get_names(), "|", s.get_strings())
	var n = r.search("zzz")
	print("k07|", n == null, "|", typeof(n))
	print("k08|", r.sub(v, "#"), "|", r.sub(v, "#", 1), "|", r.sub(v, "[$0]", 1), "|", r.sub(v, "<$1>", 1))
	var o = r.search(v, 6)
	print("k09|", o.get_start(), "|", o.get_string(), "|", r.search(v, 2).get_start())

	var nr = RegEx.new()
	nr.compile("(?<head>\\w+): (?<tail>\\w+)")
	print("k10|", nr.get_names(), "|", nr.get_group_count(), "|", nr.get_pattern())
	var ns = nr.search("xx head: yy tail zz", 3)
	print("k11|", ns.get_subject(), "|", ns.get_names(), "|", ns.get_start(), "|", ns.get_end(), "|", ns.get_string(), "|", ns.get_strings())
	print("k12|", ns.get_string(1), "|", ns.get_string(2), "|", ns.get_start(1), "|", ns.get_end(2), "|", ns.get_start(3), "|", ns.get_end(3))
	print("k13|", nr.sub("xx head: yy tail zz", "[${tail}]-${head}", 1), "|", nr.sub("xx head: yy tail zz", "$0", 1))

	var er = RegEx.new()
	er.compile("a*")
	var ev := "baaa"
	var el := []
	for e in er.search_all(ev):
		el.append([e.get_start(), e.get_end(), e.get_string()])
	print("k14|", el)
	print("k15|", er.sub(ev, "#"), "|", er.sub(ev, "#", 1), "|", er.sub(ev, "[$0]", 1), "|", er.sub(ev, "$$", 1))

	var ur = RegEx.new()
	ur.compile("(a)?b")
	var us = ur.search("b")
	print("k16|", us.get_strings(), "|", us.get_string(1), "|", us.get_start(1), "|", us.get_end(1), "|", us.get_start(), "|", us.get_end())

	var pr = RegEx.new()
	pr.compile("[[:alpha:]]+")
	print("k17|", pr.sub("ab1cd2", "#", 1), "|", pr.search("ab1").get_string(), "|", pr.get_group_count(), "|", pr.get_names())
	var ir = RegEx.new()
	ir.compile("(?i)abc")
	print("k18|", ir.search("zABCz").get_string(), "|", ir.sub("zabcz", "#", 1), "|", ir.get_group_count())
	var ar = RegEx.new()
	ar.compile("a|ab")
	print("k19|", ar.search("ab").get_string(), "|", ar.sub("ab", "#", 1), "|", ar.search_all("aab").size())

	var br = RegEx.new()
	br.compile("(?<name>\\w+)-\\k<name>")
	print("k20|", br.get_names(), "|", br.get_group_count(), "|", br.search("aa-a").get_string(), "|", br.search("aa-a").get_strings())
	var lr = RegEx.new()
	lr.compile("a(?=b)")
	print("k21|", lr.search("ab").get_string(), "|", lr.search("ab").get_end(), "|", lr.sub("ab ab", "#", 1))

	var dr = RegEx.new()
	dr.compile("^\\d+$")
	print("k22|", dr.search("123").get_string(), "|", dr.search("12a") == null, "|", dr.sub("123", "#", 1))
	dr.clear()
	print("k23|", dr.is_valid(), "|", dr.get_pattern())

	var rr = RegEx.new()
	rr.compile("\\w+")
	var rv := "aa bb cc"
	var rl := []
	for e in rr.search_all(rv, 3):
		rl.append([e.get_start(), e.get_string()])
	print("k24|", rl, "|", rr.sub(rv, "#", 0, 3), "|", rr.sub(rv, "#", 1, 3), "|", rr.search(rv, 6).get_start())
	quit()
