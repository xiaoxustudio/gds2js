const STATIC_MEMBER_FNS = {
	"Vector2": "vector2Const",
	"Vector3": "vector3Const",
	"Vector2i": "vector2iConst",
	"Vector3i": "vector3iConst",
	"Vector4": "vector4Const",
	"Vector4i": "vector4iConst",
	"Color": "colorStatic",
	"String": "stringStatic",
	"Callable": "callableStatic",
}


static func static_member_fn(e):
	if e["kind"] == "ident":
		return STATIC_MEMBER_FNS.get(e["name"])
	return null
