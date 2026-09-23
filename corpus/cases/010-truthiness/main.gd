extends SceneTree
func _initialize():
    print(not not [])
    print(not not {})
    print(not not 0)
    print(not not 0.0)
    print(not not "")
    print(not not [0])
    print(not not "0")
    if []:
        print("empty-array-true")
    else:
        print("empty-array-false")
    quit()
