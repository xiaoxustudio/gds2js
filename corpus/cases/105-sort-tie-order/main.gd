extends SceneTree

func _initialize():
	var vall012 = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11]]
	vall012.sort_custom(func(x, y): return x[0] < y[0])
	var oall012 = ""
	for q in vall012:
		oall012 += str(q[1]) + ","
	print("all012 ", oall012)
	var vall016 = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14],[0,15]]
	vall016.sort_custom(func(x, y): return x[0] < y[0])
	var oall016 = ""
	for q in vall016:
		oall016 += str(q[1]) + ","
	print("all016 ", oall016)
	var valt212 = [[0,0],[1,1],[0,2],[1,3],[0,4],[1,5],[0,6],[1,7],[0,8],[1,9],[0,10],[1,11]]
	valt212.sort_custom(func(x, y): return x[0] < y[0])
	var oalt212 = ""
	for q in valt212:
		oalt212 += str(q[1]) + ","
	print("alt212 ", oalt212)
	var valt216 = [[0,0],[1,1],[0,2],[1,3],[0,4],[1,5],[0,6],[1,7],[0,8],[1,9],[0,10],[1,11],[0,12],[1,13],[0,14],[1,15]]
	valt216.sort_custom(func(x, y): return x[0] < y[0])
	var oalt216 = ""
	for q in valt216:
		oalt216 += str(q[1]) + ","
	print("alt216 ", oalt216)
	var vcyc312 = [[0,0],[1,1],[2,2],[0,3],[1,4],[2,5],[0,6],[1,7],[2,8],[0,9],[1,10],[2,11]]
	vcyc312.sort_custom(func(x, y): return x[0] < y[0])
	var ocyc312 = ""
	for q in vcyc312:
		ocyc312 += str(q[1]) + ","
	print("cyc312 ", ocyc312)
	var vcyc316 = [[0,0],[1,1],[2,2],[0,3],[1,4],[2,5],[0,6],[1,7],[2,8],[0,9],[1,10],[2,11],[0,12],[1,13],[2,14],[0,15]]
	vcyc316.sort_custom(func(x, y): return x[0] < y[0])
	var ocyc316 = ""
	for q in vcyc316:
		ocyc316 += str(q[1]) + ","
	print("cyc316 ", ocyc316)
	var vlead212 = [[1,0],[1,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11]]
	vlead212.sort_custom(func(x, y): return x[0] < y[0])
	var olead212 = ""
	for q in vlead212:
		olead212 += str(q[1]) + ","
	print("lead212 ", olead212)
	var vlead216 = [[1,0],[1,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14],[0,15]]
	vlead216.sort_custom(func(x, y): return x[0] < y[0])
	var olead216 = ""
	for q in vlead216:
		olead216 += str(q[1]) + ","
	print("lead216 ", olead216)
	var vmul5r312 = [[0,0],[2,1],[1,2],[0,3],[2,4],[1,5],[0,6],[2,7],[1,8],[0,9],[2,10],[1,11]]
	vmul5r312.sort_custom(func(x, y): return x[0] < y[0])
	var omul5r312 = ""
	for q in vmul5r312:
		omul5r312 += str(q[1]) + ","
	print("mul5r312 ", omul5r312)
	var vmul5r316 = [[0,0],[2,1],[1,2],[0,3],[2,4],[1,5],[0,6],[2,7],[1,8],[0,9],[2,10],[1,11],[0,12],[2,13],[1,14],[0,15]]
	vmul5r316.sort_custom(func(x, y): return x[0] < y[0])
	var omul5r316 = ""
	for q in vmul5r316:
		omul5r316 += str(q[1]) + ","
	print("mul5r316 ", omul5r316)
	var vdesc12 = [[12,0],[11,1],[10,2],[9,3],[8,4],[7,5],[6,6],[5,7],[4,8],[3,9],[2,10],[1,11]]
	vdesc12.sort_custom(func(x, y): return x[0] < y[0])
	var odesc12 = ""
	for q in vdesc12:
		odesc12 += str(q[1]) + ","
	print("desc12 ", odesc12)
	var vdesc16 = [[16,0],[15,1],[14,2],[13,3],[12,4],[11,5],[10,6],[9,7],[8,8],[7,9],[6,10],[5,11],[4,12],[3,13],[2,14],[1,15]]
	vdesc16.sort_custom(func(x, y): return x[0] < y[0])
	var odesc16 = ""
	for q in vdesc16:
		odesc16 += str(q[1]) + ","
	print("desc16 ", odesc16)
	var vtwoHalf12 = [[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11]]
	vtwoHalf12.sort_custom(func(x, y): return x[0] < y[0])
	var otwoHalf12 = ""
	for q in vtwoHalf12:
		otwoHalf12 += str(q[1]) + ","
	print("twoHalf12 ", otwoHalf12)
	var vtwoHalf16 = [[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14],[0,15]]
	vtwoHalf16.sort_custom(func(x, y): return x[0] < y[0])
	var otwoHalf16 = ""
	for q in vtwoHalf16:
		otwoHalf16 += str(q[1]) + ","
	print("twoHalf16 ", otwoHalf16)
	var vhalfDup12 = [[0,0],[0,1],[1,2],[1,3],[2,4],[2,5],[3,6],[3,7],[4,8],[4,9],[5,10],[5,11]]
	vhalfDup12.sort_custom(func(x, y): return x[0] < y[0])
	var ohalfDup12 = ""
	for q in vhalfDup12:
		ohalfDup12 += str(q[1]) + ","
	print("halfDup12 ", ohalfDup12)
	var vhalfDup16 = [[0,0],[0,1],[1,2],[1,3],[2,4],[2,5],[3,6],[3,7],[4,8],[4,9],[5,10],[5,11],[6,12],[6,13],[7,14],[7,15]]
	vhalfDup16.sort_custom(func(x, y): return x[0] < y[0])
	var ohalfDup16 = ""
	for q in vhalfDup16:
		ohalfDup16 += str(q[1]) + ","
	print("halfDup16 ", ohalfDup16)
	var vzigzag12 = [[0,0],[0,1],[1,2],[1,3],[0,4],[0,5],[1,6],[1,7],[0,8],[0,9],[1,10],[1,11]]
	vzigzag12.sort_custom(func(x, y): return x[0] < y[0])
	var ozigzag12 = ""
	for q in vzigzag12:
		ozigzag12 += str(q[1]) + ","
	print("zigzag12 ", ozigzag12)
	var vzigzag16 = [[0,0],[0,1],[1,2],[1,3],[0,4],[0,5],[1,6],[1,7],[0,8],[0,9],[1,10],[1,11],[0,12],[0,13],[1,14],[1,15]]
	vzigzag16.sort_custom(func(x, y): return x[0] < y[0])
	var ozigzag16 = ""
	for q in vzigzag16:
		ozigzag16 += str(q[1]) + ","
	print("zigzag16 ", ozigzag16)
	var vdistinct12 = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10],[11,11]]
	vdistinct12.sort_custom(func(x, y): return x[0] < y[0])
	var odistinct12 = ""
	for q in vdistinct12:
		odistinct12 += str(q[1]) + ","
	print("distinct12 ", odistinct12)
	var vdistinct16 = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10],[11,11],[12,12],[13,13],[14,14],[15,15]]
	vdistinct16.sort_custom(func(x, y): return x[0] < y[0])
	var odistinct16 = ""
	for q in vdistinct16:
		odistinct16 += str(q[1]) + ","
	print("distinct16 ", odistinct16)
	quit()
