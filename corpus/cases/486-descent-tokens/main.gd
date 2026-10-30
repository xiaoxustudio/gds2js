extends SceneTree

const TAB_WIDTH = 8
const PUNCT = ["**=", "<<=", ">>=", "**", "<<", ">>", ":=", "->", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<=", ">=", "==", "!=", "&&", "||", "..", "(", ")", "[", "]", "{", "}", ",", ":", ";", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "~", "!", "<", ">", "@", "$"]
const KEYWORDS = ["and", "as", "await", "break", "breakpoint", "class", "class_name", "const", "continue", "elif", "else", "enum", "export", "extends", "false", "for", "func", "get", "if", "in", "is", "master", "mastersync", "match", "not", "null", "onready", "or", "pass", "puppet", "puppetsync", "remote", "remotesync", "return", "set", "setget", "signal", "static", "true", "var", "when", "while"]
const OPENERS = ["(", "[", "{"]
const CLOSERS = [")", "]", "}"]


func _initialize():
	punct_face("**= 2 ** 3 := -> .. <= >= != == && || += -= *= /= %= &= |= ^= ~ ! < > @ $ ; , : . ( ) [ ] { } + - * / % << >>")
	punct_face("a:=b->c..d")
	keyword_face(["var", "if", "when", "await", "breakpoint", "namespace", "void", "self", "super", "trait", "func", "true", "assert", "preload", "master", "sync", "remote", "setget"])
	ident_face("")
	ident_face("_")
	ident_face("0")
	ident_face("z")
	ident_face("Z")
	ident_face("é")
	ident_face("ß")
	ident_face("γ")
	ident_face("中")
	ident_face("、")
	ident_face("（")
	ident_face("😀")
	ident_face("​")
	bracket_face("()[]{}<>=!+-*/%")
	print("w|", TAB_WIDTH, "|", PUNCT.size(), "|", KEYWORDS.size(), "|", OPENERS.size(), "|", CLOSERS.size())
	print("x|", punct_at("2 **= 3", 2), "|", punct_at("2 ** 3", 2), "|", punct_at("a.b", 1), "|", punct_at("a", 1))
	quit()


func has_name(table, name):
	for k in table:
		if k == name:
			return true
	return false


func punct_face(src):
	var i = 0
	var n = src.length()
	while i < n:
		var hit = punct_at(src, i)
		if hit == "":
			i += 1
			continue
		print("p|", i, "|", hit, "|", hit.length())
		i += hit.length()


func punct_at(src, at):
	for p in PUNCT:
		if src.substr(at, p.length()) == p:
			return p
	return ""


func keyword_face(list):
	for w in list:
		print("k|", w, "|", has_name(KEYWORDS, w))


func is_digit(c):
	return c >= "0" and c <= "9"


func in_xid(u):
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
	if u >= 0x5D0 and u <= 0x5EA:
		return true
	if u >= 0x620 and u <= 0x64A:
		return true
	if u >= 0x671 and u <= 0x6D3:
		return true
	if u >= 0x900 and u <= 0x939:
		return true
	if u >= 0x3040 and u <= 0x30FF:
		return true
	if u >= 0x3131 and u <= 0x318E:
		return true
	if u >= 0x31A0 and u <= 0x31BF:
		return true
	if u >= 0x3400 and u <= 0x4DBF:
		return true
	if u >= 0x4E00 and u <= 0x9FFF:
		return true
	if u >= 0xA000 and u <= 0xA4CF:
		return true
	if u >= 0xAC00 and u <= 0xD7A3:
		return true
	if u >= 0xF900 and u <= 0xFAFF:
		return true
	if u >= 0x1D400 and u <= 0x1D7FF:
		return true
	return false


func head_u(c):
	if c.length() == 0:
		return -1
	return c.unicode_at(0)


func is_ident_start(c):
	if c.length() == 0:
		return false
	if c == "_":
		return true
	if c >= "a" and c <= "z":
		return true
	if c >= "A" and c <= "Z":
		return true
	return in_xid(head_u(c))


func is_ident_part(c):
	if is_digit(c):
		return true
	return is_ident_start(c)


func ident_face(c):
	print("i|", c, "|", is_ident_start(c), "|", is_ident_part(c), "|", c.length(), "|", head_u(c))


func bracket_face(src):
	var i = 0
	while i < src.length():
		var c = src[i]
		print("b|", c, "|", has_name(OPENERS, c), "|", has_name(CLOSERS, c))
		i += 1
