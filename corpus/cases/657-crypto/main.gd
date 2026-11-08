extends SceneTree

func _initialize():
	var c := Crypto.new()
	print("c1|", c.constant_time_compare(PackedByteArray([1, 2, 3]), PackedByteArray([1, 2, 3])), "|", c.constant_time_compare(PackedByteArray([1, 2]), PackedByteArray([1, 2, 3])))
	print("c2|", c.generate_random_bytes(8).size())
	var k := c.generate_rsa(1024)
	var ct := c.encrypt(k, "hello".to_utf8_buffer())
	print("c3|", ct.size(), "|", c.decrypt(k, ct).get_string_from_utf8())
	var h := HashingContext.new()
	h.start(HashingContext.HASH_SHA256)
	h.update("abc".to_utf8_buffer())
	var digest := h.finish()
	var sig := c.sign(HashingContext.HASH_SHA256, digest, k)
	var bad := digest.duplicate()
	bad[0] = bad[0] ^ 1
	print("c4|", sig.size(), "|", c.verify(HashingContext.HASH_SHA256, digest, sig, k), "|", c.verify(HashingContext.HASH_SHA256, bad, sig, k))
	print("c5|", c.hmac_digest(HashingContext.HASH_SHA256, "key".to_utf8_buffer(), "msg".to_utf8_buffer()).hex_encode())
	print("c6|", c.hmac_digest(HashingContext.HASH_SHA1, "key".to_utf8_buffer(), "msg".to_utf8_buffer()).hex_encode())
	var cert := c.generate_self_signed_certificate(k, "CN=test,O=org", "20240101000000", "20340101000000")
	print("c7|", cert != null)
	quit()
