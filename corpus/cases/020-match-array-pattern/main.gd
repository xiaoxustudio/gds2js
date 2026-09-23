extends SceneTree
func _initialize():
    match [1, 2]:
        [1, var v]:
            print(v)
        _:
            print("none")
    match 3:
        1, 2:
            print("one-or-two")
        3:
            print("three")
    quit()
