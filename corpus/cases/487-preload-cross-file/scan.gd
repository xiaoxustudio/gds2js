
const T = preload("res://tokens.gd")


static func split(src):
	var words = []
	var i = 0
	var n = src.length()
	while i < n:
		var c = src[i]
		if c == " ":
			i += 1
			continue
		if T.is_digit(c):
			var j = i
			while j < n and T.is_digit(src[j]):
				j += 1
			words.append("num-" + str(j - i))
			i = j
			continue
		var hit = T.punct_at(src, i)
		if hit != "":
			words.append("punct-" + hit)
			i += hit.length()
			continue
		words.append("other-" + c)
		i += 1
	return words
