extends SceneTree
func _initialize():
    var b = Base.new()
    print(b.tag())
    print(b is Base)
    print(b.hp)
    quit()

class Base:
    var hp := 10
    func tag(): return "base-%d" % hp
