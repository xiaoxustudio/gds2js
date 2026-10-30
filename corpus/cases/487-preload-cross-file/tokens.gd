
const TAB_WIDTH = 8
const PUNCT = ["**=", "<<=", ">>=", "**", "<<", ">>", ":=", "->", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<=", ">=", "==", "!=", "&&", "||", "..", "(", ")", "[", "]", "{", "}", ",", ":", ";", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "~", "!", "<", ">", "@", "$"]


static func is_digit(c):
	return c >= "0" and c <= "9"


static func punct_at(src, at):
	for p in PUNCT:
		if src.substr(at, p.length()) == p:
			return p
	return ""


static func punct_face(src):
	var out = []
	var i = 0
	var n = src.length()
	while i < n:
		var hit = punct_at(src, i)
		if hit == "":
			i += 1
			continue
		out.append(str(i) + ":" + hit)
		i += hit.length()
	return out
