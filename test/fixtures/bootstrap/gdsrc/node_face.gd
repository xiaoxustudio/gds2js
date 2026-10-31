const G = preload("res://globals.gd")


static func node_self_props(base):
	if base == null:
		return {}
	return G.NODE_SELF_PROPS.get(base, {})
