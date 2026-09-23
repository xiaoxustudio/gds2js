func _ready():
    for i in range(100):
            var child = Node.new()
            child.name = str("Name-", i)
            add_child(child)
