extends SceneTree

const HAYS = ["hello", "Hello World", "aaa", "ababab", "a", "0123456789", "xYxyX", "test_case-1.2", "i am", "McDonald"]
const KEYS = ["l", "L", "ll", "lo", "z", " ", "_", "x", "X", "567", "aa", "o World", "I", "d"]
const MODEL_HAYS = ["0123456789", "xyxyxy", "a", "", "hello"]
const MODEL_KEYS = ["", "0", "5", "9", "01", "45", "89", "456", "789", "34567", "0123456789", "x", "xy", "xyx", "l", "ll"]
const CAPS = [
	"hello world", "HELLO WORLD", "hELLo wORLd", "hello", "", " ", "   ",
	"  hello  world  ", "leading ", " test_case", "test_case", "test-case", "test.case",
	"a b c", "i am", "i", "I", "i'm", "don't", "x i x", "ix", "XI",
	"xi ii iii iv v vi vii viii ix x", "XII", "xx", "iii", "iv", "iiiad", "xiv",
	"six x ix", "123 abc", "hello123world", "été école", "ß ss", "a'a",
	"i i i", "it's a test", "THE III RD", "  i  ", "iX", "xi", "min", "mix",
	"vi", "vii", "vil", "iI", "xIx", "ii", "iiii", "v", "vix", "a i b", "I23",
	"i-", "-i", "_i", "McDonald", "HELLO, WORLD!", "a.b", "AB CD", "ABC", "A B",
	"AB", "AbCdEf", "AAa", "AAAa", "aA", "aAA", "1a", "1A", "a1", "A1", "1Aa",
	"2aa", "2aA", "upperCamelCase", "lower_snake_case", "kebab-case-string",
	"multiple   spaces\tbetween", "tab\there", "a b  c", "  ", "\t", "1", "12 34",
	"Ⅻ roman", "ÄÖÜ äöü", "Ω pa", "ﬁ ligature", "ǅ digraph", "Ǆ digraph",
	"ǆ digraph", "ΣΣΣ", "ς end", "İstanbul", "ıstanbul", "Ǳǲǳ", "ﬅ ligature",
]

func _join(parts: Array) -> String:
	var out: Array[String] = []
	for p in parts:
		out.append(str(p))
	return ";".join(out)

func _initialize():
	for h in HAYS:
		for k in KEYS:
			print("replace\t" + h + "\t" + k + "\t" + h.replace(k, "|") + "\t" + h.replacen(k, "|") + "\t" + h.replace(k, "") + "\t" + h.replacen(k, ""))
	for h in MODEL_HAYS:
		for k in MODEL_KEYS:
			var parts: Array = []
			for f in range(-12, 13):
				parts.append(str(f) + "=" + str(h.find(k, f)) + "/" + str(h.findn(k, f)) + "/" + str(h.rfind(k, f)) + "/" + str(h.rfindn(k, f)))
			print("find\t" + h + "\t" + k + "\t" + _join(parts))
	for h in MODEL_HAYS:
		for k in MODEL_KEYS:
			print("find0\t" + h + "\t" + k + "\t" + str(h.find(k)) + "\t" + str(h.rfind(k)) + "\t" + str(h.findn(k)) + "\t" + str(h.rfindn(k)))
	for c in CAPS:
		print("cap\t" + c + "\t" + c.capitalize())
	for cp in [9, 10, 13, 32, 133, 160, 5760, 8192, 8195, 8232, 8233, 8239, 8287, 12288, 65535]:
		var seps = String.chr(cp)
		print("capsep\t" + str(cp) + "\t" + ("a" + seps + "b").capitalize())
	for cp in [45, 173, 1426, 6150, 8208, 8209, 8210, 8211, 8212, 8213, 11799, 11802, 12540, 65048, 65123, 65293, 95, 65510, 43, 46]:
		var seps = String.chr(cp)
		print("caphyphen\t" + str(cp) + "\t" + ("a" + seps + "b").capitalize())
	for cp in [48, 1632, 1984, 660, 661, 2546, 65296]:
		var dgt = String.chr(cp)
		print("capdigit\t" + str(cp) + "\t" + (dgt + "ab").capitalize() + "\t" + ("a" + dgt + "b").capitalize() + "\t" + (dgt + "AB").capitalize())
	print("utf\t" + str("😀a😀".find("a")) + "\t" + str("😀a😀".length()) + "\t" + "😀a😀".replace("a", "X") + "\t" + "😀A".capitalize())
	print("utf2\t" + str("é́x".find("x")) + "\t" + str("🦀🦀b".rfind("b")) + "\t" + "🦀b🦀".replace("b", "Z"))
	quit()
