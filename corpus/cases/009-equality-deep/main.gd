extends SceneTree
func _initialize():
    print([1, 2] == [1, 2])
    print({"a": [1]} == {"a": [1]})
    print(1.0 == 1)
    print(1 == 1.0)
    var a = [1, 2]
    var b = a
    print(a == b)
    quit()
