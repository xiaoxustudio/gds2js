extends SceneTree

func _initialize():
	var h := HashingContext.new()
	print("h1|", h.start(HashingContext.HASH_MD5), "|", h.update("abc".to_utf8_buffer()))
	print("h2|", h.finish())
	var s1 := HashingContext.new()
	s1.start(HashingContext.HASH_SHA1)
	s1.update("abc".to_utf8_buffer())
	print("h3|", s1.finish())
	var s2 := HashingContext.new()
	s2.start(HashingContext.HASH_SHA256)
	s2.update("ab".to_utf8_buffer())
	s2.update("c".to_utf8_buffer())
	print("h4|", s2.finish())
	print("h5|", HashingContext.HASH_MD5, "|", HashingContext.HASH_SHA1, "|", HashingContext.HASH_SHA256)
	quit()
