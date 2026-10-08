extends SceneTree

const KN = ^"x/y"

func _initialize():
	var p = ^"a/b"
	print("t01|", p)
	print("t02|", typeof(p))
	print("t03|", str(p))
	print("t04|", var_to_str(p))
	print("t05|", p == NodePath("a/b"))
	print("t06|", p.get_name_count(), "|", p.get_name(1))
	print("t07|", p.is_absolute(), "|", ^"/a/b".is_absolute())
	print("t08|", p is NodePath)
	print("t09|", ^"")
	print("t10|", ^"a:1")
	print("t11|", ^"中/文")
	print("t12|", ^"a b")
	var d = { ^"a/b": 1 }
	print("t13|", d)
	print("t14|", d.has(NodePath("a/b")))
	print("t15|", d.keys())
	print("t16|", d[NodePath("a/b")])
	var t: NodePath = ^"n0/one"
	print("t17|", t)
	print("t18|", ^"a/b" == ^"a/b")
	print("t19|", ^"a" == ^"b")
	print("t20|", KN, "|", typeof(KN), "|", KN == NodePath("x/y"))
	print("t21|", ^"a\tb" == NodePath("a\tb"))
	print("t22|", ^"a\tb" == NodePath("a\\tb"))
	print("t23|", str(^"a\tb"))
	print("t24|", var_to_str(^"a\tb"))
	print("t25|", ^"a\tb".get_name_count())
	print("t26|", ^"a\nb")
	print("t27|", ^"a\"b")
	print("t28|", ^"a\\b")
	var q = ^"a/b:0:1"
	print("t29|", q)
	print("t30|", q.get_subname_count(), "|", q.get_subname(1))
	print("t31|", q == NodePath("a/b:0:1"))
	print("t32|", ^"$A/B".is_absolute())
	print("t33|", ^"..")
	print("t34|", p.get_subname_count())
	var arr = [^"a/b"]
	print("t35|", ^"a/b" in arr)
	print("t36|", "a/b" in arr)
	print("t37|", arr.has(^"a/b"))
	print("t38|", arr.has("a/b"))
	print("t39|", "a/b" in d)
	print("t40|", &"a/b" in d)
	print("t41|", d.get("a/b", 0))
	print("t42|", d.has(^"a/b"))
	quit()
