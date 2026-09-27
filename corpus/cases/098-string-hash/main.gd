extends SceneTree

func _initialize():
	var sn: StringName = &"abc"
	print("abc".hash(), " ", "".hash(), " ", "a".hash(), " ", "Hello, World!".hash())
	print("你好".hash(), " ", "😀".hash(), " ", "😀😁".hash(), " ", "￿".hash(), " ", "𐀀".hash())
	print("abcdefghijklmnopqrstuvwxyz".hash(), " ", "the quick brown fox jumps over the lazy dog".hash())
	print("0123456789".hash(), " ", "A".hash(), " ", " ".hash(), " ", "abcabc".hash(), " ", "0".hash(), " ", "z".hash())
	print("	
\\\"".hash(), " ", sn.hash(), " ", hash("abc"), " ", hash(sn), " ", hash(""), " ", hash("你好"))
	print(hash(true), " ", hash(false), " ", hash(null))
	print("abc".hash() == "abc".hash(), " ", "abc".hash() < "abd".hash(), " ", "abc".hash() == "abd".hash())
	quit()
