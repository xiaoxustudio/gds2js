extends SceneTree
func _initialize():
    var a = [1, 2]
    var b = a
    b.append(3)
    print(a)
    print(b)
    print(a == b)
    var c = a.duplicate()
    c.append(9)
    print(a)
    quit()
