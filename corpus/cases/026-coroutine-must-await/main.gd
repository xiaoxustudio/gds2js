extends SceneTree
func _initialize():
    var r = f()
    print(r)
    quit()

func f():
    await create_timer(0.01).timeout
    return 1
