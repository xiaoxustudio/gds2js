extends SceneTree

func _initialize():
	var r1 = "a" % 1
	var r2 = "a%%" % 1
	var r3 = "a%d" % "b"
	var r4 = "a%d" % true
	var r5 = "a%d" % null
	var r6 = "a%n" % 1
	var r7 = "a%(k)s" % 1
	var r8 = "a%" % 1
	var r9 = "a%-" % 1
	var r10 = "a%d%s" % 1
	var r11 = "a%u" % 1
	var r12 = "a%i" % 1
	var r13 = "a%#x" % 1
	var r14 = "a%d" % Vector2(1, 2)
	var r15 = "a%d" % ^"a"
	var r16 = "a%c" % true
	var r17 = "a%c" % &"ab"
	var r18 = "a%c" % -1
	var r19 = "a%v" % 1
	var r20 = "a%v" % "b"
	var r21 = "a%*d" % "b"
	var r22 = "a%*c" % &"b"
	print(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19, r20, r21, r22)
	quit()
