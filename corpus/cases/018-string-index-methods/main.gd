extends SceneTree
func _initialize():
    var s = "hello"
    print(s[0])
    print(s.length())
    print(s.substr(1, 3))
    print(s.to_upper())
    print("%d/%s" % [5, "x"])
    quit()
