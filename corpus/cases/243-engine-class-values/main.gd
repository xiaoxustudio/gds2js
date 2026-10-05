extends SceneTree

class Inner extends RefCounted:
	func v():
		return Node

func _initialize():
	print("n01|", typeof(Node), "|", typeof(Label), "|", typeof(Object))
	print("n02|", Node == Node, "|", Node == Label, "|", typeof(Node) == 24)
	var k = Node
	print("n03|", k == Node, "|", k == Label, "|", typeof(k))
	var d = {Node: 1, Label: 2}
	print("n04|", d.size(), "|", d.has(Node), "|", d[Node], "|", d[Label])
	print("n05|", d.has(k))
	var arr = [Node, Label, Node]
	print("n06|", arr.size(), "|", arr.has(Label), "|", arr.count(Node))
	print("n07|", GDScript == Node, "|", typeof(GDScript))
	print("n08|", Inner.new().v() == Node)
	var res = Resource
	print("n09|", res == Resource, "|", typeof(res))
	print("n10|", Node != Label, "|", [Node].size())
	quit()
