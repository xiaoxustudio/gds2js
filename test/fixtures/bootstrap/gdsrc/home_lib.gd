const MASK = 4294967295


static func _feed(h, unit):
	h = h ^ unit
	h = (h * 16777619) & MASK
	return h


static func fnv1a(s):
	var h = 2166136261
	for i in s.length():
		var cp = s.unicode_at(i)
		if cp > 65535:
			cp = cp - 65536
			h = _feed(h, 55296 + (cp >> 10))
			h = _feed(h, 56320 + (cp & 1023))
		else:
			h = _feed(h, cp)
	return _hex(h)


static func _hex(h):
	var digits = "0123456789abcdef"
	if h == 0:
		return "0"
	var out = ""
	while h > 0:
		out = digits[h & 15] + out
		h = h >> 4
	return out
