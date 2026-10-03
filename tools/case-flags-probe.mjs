import { mkdirSync, writeFileSync } from "node:fs";

const DIR = "corpus/cases/000-probe-cf-0";

const SRC = `extends SceneTree

func _initialize():
	var up: Array[String] = []
	var lo: Array[String] = []
	var sep: Array[String] = []
	var dig: Array[String] = []
	var cp := 0
	while cp <= 0x10FFFF:
		if cp < 0xD800 || cp > 0xDFFF:
			var c := String.chr(cp)
			if ("a" + c).capitalize().contains(" "):
				up.append("%x" % cp)
			if (c + "A").capitalize().contains(" "):
				lo.append("%x" % cp)
			if ("a" + c + "b").capitalize() == "A B":
				sep.append("%x" % cp)
			if (c + "ab").capitalize().contains(" "):
				dig.append("%x" % cp)
		cp += 1
	print("UP %d %s" % [up.size(), " ".join(up)])
	print("LO %d %s" % [lo.size(), " ".join(lo)])
	print("SEP %d %s" % [sep.size(), " ".join(sep)])
	print("DIG %d %s" % [dig.size(), " ".join(dig)])
	quit()
`;

mkdirSync(DIR, { recursive: true });
writeFileSync(`${DIR}/main.gd`, SRC, "utf8");
console.log(`${DIR}/main.gd：四个判别式（UP 含数字，tools/case-flags.mjs 里减掉 DIG），去跑：node tools/golden.mjs 000-probe-cf`);
