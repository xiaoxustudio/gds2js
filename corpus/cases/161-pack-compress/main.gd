extends SceneTree

func _initialize():
	var a = PackedByteArray([1, 2, 3, 1, 2, 3])
	var h = "hello hello hello".to_utf8_buffer()
	for mode in [1, 2, 3]:
		var ca = a.compress(mode)
		var ch = h.compress(mode)
		print("m", mode, " ", ca.size(), " ", ca.hex_encode(), " ", ch.size(), " ", ch.hex_encode())
		print("r", mode, " ", ca.decompress(6, mode), " ", ch.decompress(17, mode))
	print("t1 ", a.compress(1).decompress(20, 1), " ", a.compress(1).decompress(20, 1).size())
	print("t2 ", PackedByteArray().compress(1), " ", PackedByteArray().compress(2), " ", PackedByteArray().compress(3))
	print("t3 ", typeof(a.compress(1)), " ", typeof(a.compress(1).decompress(6, 1)))
	print("t4 ", a, " ", h)
	var big = PackedByteArray()
	for i in range(1000):
		big.append(i % 251)
	var bc = big.compress(2)
	var bd = bc.decompress(1000, 2)
	print("t5 ", bc.size(), " ", bd.size(), " ", bd[0], " ", bd[500], " ", bd[999])
	print("t6 ", a.compress(1).hex_encode() == a.compress(1).hex_encode(), " ", a.compress(1) == a.compress(1))
	quit()
