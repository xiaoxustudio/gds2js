const G = preload("res://globals.gd")


static func node_self_props(base):
	if base == null:
		return {}
	var own = G.NODE_SELF_PROPS.get(base)
	var root = G.NODE_SELF_PROPS.get("Node")
	if own == null:
		return {}
	if base == "Node" or root == null:
		return own
	var merged = root.duplicate()
	for name in own:
		merged[name] = true
	return merged
