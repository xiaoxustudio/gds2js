const TAB_WIDTH = 8
const PUNCT = ["**=", "<<=", ">>=", "**", "<<", ">>", ":=", "->", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<=", ">=", "==", "!=", "&&", "||", "..", "(", ")", "[", "]", "{", "}", ",", ":", ";", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "~", "!", "<", ">", "@", "$"]
const OPENERS = ["(", "[", "{"]
const CLOSERS = [")", "]", "}"]


static func is_digit(c):
	return c >= "0" and c <= "9"


static func head_u(c):
	if c.length() == 0:
		return -1
	return c.unicode_at(0)


static func in_xid(u):
	if u >= 0xC0 and u <= 0xD6:
		return true
	if u >= 0xD8 and u <= 0xFF:
		return true
	if u >= 0x100 and u <= 0x2FF:
		return true
	if u >= 0x370 and u <= 0x3FF:
		return true
	if u >= 0x400 and u <= 0x52F:
		return true
	if u >= 0x3040 and u <= 0x30FF:
		return true
	if u >= 0x3131 and u <= 0x318E:
		return true
	if u >= 0x3400 and u <= 0x4DBF:
		return true
	if u >= 0x4E00 and u <= 0x9FFF:
		return true
	if u >= 0xAC00 and u <= 0xD7A3:
		return true
	if u >= 0xF900 and u <= 0xFAFF:
		return true
	return false


static func is_ident_start(c):
	if c.length() == 0:
		return false
	if c == "_":
		return true
	if c >= "a" and c <= "z":
		return true
	if c >= "A" and c <= "Z":
		return true
	return in_xid(head_u(c))


static func is_ident_part(c):
	if is_digit(c):
		return true
	return is_ident_start(c)


static func punct_at(src, at):
	for p in PUNCT:
		if src.substr(at, p.length()) == p:
			return p
	return ""


static func is_opener(c):
	return OPENERS.has(c)


static func is_closer(c):
	return CLOSERS.has(c)
