extends SceneTree

func _initialize():
	var h2 := HMACContext.new()
	h2.start(HashingContext.HASH_SHA1, "key".to_utf8_buffer())
	h2.update("msg".to_utf8_buffer())
	print("h1|", h2.finish())
	var h3 := HMACContext.new()
	h3.start(HashingContext.HASH_SHA256, "key".to_utf8_buffer())
	h3.update("msg".to_utf8_buffer())
	print("h2|", h3.finish())
	var h4 := HMACContext.new()
	h4.start(HashingContext.HASH_SHA256, "a".repeat(100).to_utf8_buffer())
	h4.update("data".to_utf8_buffer())
	print("h3|", h4.finish())
	var e := EncodedObjectAsID.new()
	print("e1|", e.object_id)
	e.object_id = 42
	print("e2|", e.get_object_id(), "|", e.object_id)
	e.set_object_id(7)
	print("e3|", e.object_id)
	quit()
