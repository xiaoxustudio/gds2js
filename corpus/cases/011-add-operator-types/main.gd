extends SceneTree
func _initialize():
    print([1] + [2])
    print("a" + "b")
    print(Vector2(1, 2) + Vector2(3, 4))
    print(1 + 2.5)
    quit()
