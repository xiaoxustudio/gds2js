extends SceneTree

# 类成员之间的注释
var counter = 0  # 行尾注释

# 函数定义前的注释
func bump(n):  # 签名行尾注释
	# 函数体首行
	counter += n
	# 两条语句之间
	return counter

func _initialize():
	# 开头
	var i = 0
	while i < 3:  # while 行尾
		# 循环体首
		i += 1
		# 循环体尾
	print(bump(2))
	print(counter)
	if i > 2:
		# then 分支
		print(111)
	else:
		# else 分支
		print(222)
	for k in range(2):
		# for 体
		print(k)
	match counter:
		4:
			# match 分支体
			print(444)
		_:
			print(999)
	print("保留 # 井号")
	quit()
	# 尾部注释
# 文件最后一行也是注释
