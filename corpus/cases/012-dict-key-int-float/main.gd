extends SceneTree
func _initialize():
    var d = {}
    d[1] = "int"
    d[1.0] = "float"
    print(d.size())
    print(d)
    print(d[1])
    print(d[1.0])
    d["1"] = "str"
    print(d.size())
    quit()
