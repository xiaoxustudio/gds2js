extends SceneTree
var frames := 0

func _initialize():
    print(await f())

func f():
    await create_timer(0.02).timeout
    return 42

func _process(_d) -> bool:
    frames += 1
    if frames == 30:
        quit()
    return false
