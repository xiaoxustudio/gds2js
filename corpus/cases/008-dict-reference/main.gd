extends SceneTree
func _initialize():
    var d1 = {"x": 1}
    var d2 = d1
    d2["y"] = 2
    print(d1)
    print(d2.size())
    quit()
