extends SceneTree

var frames := 0
signal zero()
signal one(v)
signal two(a, b)

func _initialize():
    print("hello world")
    var a = 1
    a += 1
    print(a)
    print(await wait_zero())
    print(await wait_one())
    print(await wait_two())

func wait_zero():
    fire_zero.call_deferred()
    return await zero

func wait_one():
    fire_one.call_deferred()
    return await one

func wait_two():
    fire_two.call_deferred()
    return await two

func fire_zero(): zero.emit()
func fire_one(): one.emit(7)
func fire_two(): two.emit(1, 2)

func _process(_d) -> bool:
    frames += 1
    if frames == 40:
        quit()
    return false
