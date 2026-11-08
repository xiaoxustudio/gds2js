extends SceneTree

func hexb(b: PackedByteArray) -> String:
	var s := ""
	for x in b:
		s += "%02x" % x
	return s

func _initialize():
	var key := PackedByteArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
	var key32 := PackedByteArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])
	var iv := PackedByteArray([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])
	var plain := "0123456789abcdef".to_utf8_buffer()
	var c := AESContext.new()
	print("a1|", c.start(AESContext.MODE_CBC_ENCRYPT, key, iv))
	var out1 := c.update(plain)
	print("a2|", hexb(out1))
	print("a3|", hexb(c.get_iv_state()))
	print("a4|", hexb(c.update("fedcba9876543210".to_utf8_buffer())))
	c.finish()
	var d := AESContext.new()
	d.start(AESContext.MODE_CBC_DECRYPT, key, iv)
	print("a5|", hexb(d.update(out1)))
	d.finish()
	var e := AESContext.new()
	e.start(AESContext.MODE_ECB_ENCRYPT, key, PackedByteArray())
	print("a6|", hexb(e.update(plain)))
	e.finish()
	var f := AESContext.new()
	f.start(AESContext.MODE_ECB_ENCRYPT, key32, PackedByteArray())
	var ct := f.update(plain)
	print("a7|", hexb(ct))
	f.finish()
	var g := AESContext.new()
	g.start(AESContext.MODE_ECB_DECRYPT, key32, PackedByteArray())
	print("a8|", hexb(g.update(ct)))
	g.finish()
	var h := AESContext.new()
	h.start(AESContext.MODE_CBC_ENCRYPT, key32, iv)
	print("a9|", hexb(h.update(plain)))
	h.finish()
	print("a10|", AESContext.MODE_ECB_ENCRYPT, "|", AESContext.MODE_ECB_DECRYPT, "|", AESContext.MODE_CBC_ENCRYPT, "|", AESContext.MODE_CBC_DECRYPT)
	quit()
