extends SceneTree
func _initialize():
    var acc = []
    for i in range(3):
        acc.append(i)
    print(acc)
    var ks = []
    for k in {"a": 1, "b": 2}:
        ks.append(k)
    print(ks)
    var vs = []
    for x in [10, 20]:
        vs.append(x)
    print(vs)
    quit()
