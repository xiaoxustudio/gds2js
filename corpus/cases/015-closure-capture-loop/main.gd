extends SceneTree
func _initialize():
    var fns = []
    for i in range(3):
        fns.append(func(): return i)
    var out = []
    for f in fns:
        out.append(f.call())
    print(out)
    quit()
