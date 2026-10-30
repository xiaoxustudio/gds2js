extends SceneTree

func _initialize():
	var d := {"b": 1, "a": {"z": 2, "y": [3, 4]}, "f": 1.0, "g": [0.1, 1.0 / 3.0]}
	print("k01|", JSON.stringify(d))
	print("k02|", JSON.stringify(d, "  "))
	print("k03|", JSON.stringify(d, "\t"))
	print("k04|", JSON.stringify(d, "", false), "|", JSON.stringify(d, "", true))
	var s := {}
	s["zeta"] = 1
	s["alpha"] = 2
	s["m"] = 3
	print("k05|", JSON.stringify(s), "|", JSON.stringify(s, "", false))
	print("k06|", JSON.stringify({1: 2, 2.5: 3, true: 4}))
	print("k07|", JSON.stringify(["a\"b", "a\\b", "a/b", "a\nb", "tab\tb", "back\fb", "\u0007", "\u000b", "é中"]))
	print("k08|", JSON.stringify([null, true, false, 5, -5, 0, "s"]))
	var xs := [0.0, -0.0, 1.0, 1.0 / 3.0, 1e15, 1e20, 1e-7, 1e-20, -1.5]
	print("k09|", JSON.stringify(xs), "|", JSON.stringify(xs, "", true, true))
	print("k10|", JSON.stringify([1.0 / 0.0, -1.0 / 0.0]), "|", JSON.stringify([1.0 / 0.0], "", true, true))
	print("k11|", JSON.stringify([Vector2(1, 2)]), "|", JSON.stringify(Color(1, 0, 0)), "|", JSON.stringify(PackedByteArray([1, 2])))
	print("k12|", JSON.stringify([PackedStringArray(["a", "b"])]), "|", JSON.stringify([[]]), "|", JSON.stringify([{}]))
	var j := JSON.new()
	print("k13|", str(j), "|", typeof(j), "|", j is JSON, "|", j is RefCounted, "|", j is Object, "|", j.get_class(), "|", j.is_class("RefCounted"))
	print("iid|", j.get_instance_id())
	print("k14|", j.stringify({"a": 1}), "|", j.parse_string("{\"a\": 1}"), "|", j.get_error_message(), "|", j.get_error_line(), "|", j.get_data())
	print("k15|", JSON.parse_string("{\"a\": 1}"), "|", JSON.parse_string("[1, [2, 3]]"), "|", JSON.parse_string("{}"), "|", JSON.parse_string("[]"))
	print("k16|", JSON.parse_string("true"), "|", JSON.parse_string("false"), "|", JSON.parse_string("null"), "|", JSON.parse_string("5"), "|", JSON.parse_string("5.0"), "|", JSON.parse_string("\"s\""))
	print("k17|", JSON.parse_string("{\"k\": 1e5}"), "|", JSON.parse_string("[1E-3, -0, 007]"), "|", JSON.parse_string("{\"a\": \"x\\u00e9y\"}"))
	print("k18|", JSON.parse_string("  {  \"a\" : [ 1 , 2 ]  }  "), "|", JSON.parse_string("{\"a\": 1, \"a\": 2}"), "|", JSON.parse_string("[\"a\\/b\", \"c\\\\d\", \"e\\nf\"]"))
	var v = JSON.parse_string("{\"a\": 1}")
	print("k19|", typeof(v), "|", v is Dictionary, "|", typeof(v["a"]), "|", typeof(JSON.parse_string("[1]")), "|", JSON.parse_string("[1]") is Array)
	print("k20|", j.parse("{\"a\": 1}"), "|", j.get_data(), "|", j.get_error_line(), "|", j.get_error_message())
	var t := JSON.new()
	print("k21|", j == t, "|", j == j, "|", str(JSON), "|", typeof(JSON))
	var w: Variant = JSON.new()
	print("k22|", w.stringify([1]), "|", w.parse_string("[1]"), "|", w.stringify([1.5], "", true, true))
	print("k23|", JSON.stringify(JSON.parse_string(JSON.stringify(d))))
	quit()
