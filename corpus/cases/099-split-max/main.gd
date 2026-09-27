extends SceneTree

func _initialize():
	print(("a,b,c".split(",", true, 1)), " ", ("a,b,c".split(",", true, 0)), " ", ("a,b,c".split(",", true, -1)))
	print(("a,,b".split(",", true, 1)), " ", ("a,,b".split(",", false, 1)), " ", ("a,,b".split(",", false, 2)))
	print(("a,,b".split(",", true, 2)), " ", ("a,b,,c,d".split(",", false, 2)), " ", ("a,b,,c,d".split(",", true, 3)))
	print((",a,".split(",", true, 1)), " ", (",a,".split(",", false, 1)), " ", (",a,,b,".split(",", false, 1)))
	print((",a,,b,".split(",", false, 2)), " ", ("  a  ".split(" ", false, 2)), " ", (",,,".split(",", false, 1)))
	print(("aa".split("a", true, 1)), " ", ("aa".split("a", false, 1)), " ", ("aaa".split("aa", true, 1)))
	print(("a,b,".split(",", false, 1)), " ", ("a, ,b".split(",", false, 1)), " ", ("a,b,c".split(",", false, 2)))
	print(("abc".split("", true, 1)), " ", ("abc".split("", false, 1)), " ", ("abc".split("", true, 2)))
	print(("ab,,cd".split("", false, 2)), " ", ("a::b::c".split("::", true, 1)), " ", ("a,b,c".split(",", true, 5)))
	print(("".split(",", true, 1)), " ", ("".split(",", false, 1)), " ", ("x".split(",", true, 1)))
	print(("a,b,c,d".split(",", true, 2)), " ", ("aXXbXXc".split("XX", false, 1)), " ", ("a,,,b".split(",", true, 1)))
	quit()
