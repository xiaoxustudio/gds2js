extends SceneTree
func _initialize():
    var x = 9223372036854775807
    print(x + 1)
    var y = -9223372036854775807 - 1
    print(-y)
    quit()
