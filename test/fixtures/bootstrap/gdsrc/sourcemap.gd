const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

static func vlq(value):
	var v = ((-value) << 1) | 1 if value < 0 else value << 1
	var out = ""
	while true:
		var digit = v & 31
		v = v >> 5
		if v > 0:
			digit = digit | 32
		out += B64.substr(digit, 1)
		if v <= 0:
			break
	return out

static func dedupe_by_gen_line(ms):
	var seen = {}
	var out = []
	for m in ms:
		if seen.has(m["genLine"]):
			continue
		seen[m["genLine"]] = true
		out.append(m)
	return out

static func encode_mappings(sorted_in):
	var copy = []
	for m in sorted_in:
		copy.append(m)
	copy.sort_custom(func(a, b): return a["genLine"] < b["genLine"])
	var by_gen = dedupe_by_gen_line(copy)
	var max_line = -1
	for m in by_gen:
		max_line = max(max_line, m["genLine"])
	var lines = []
	for _i in range(max_line + 1):
		lines.append("")
	var prev_src_idx = 0
	var prev_src_line = 0
	var prev_src_col = 0
	for m in by_gen:
		var seg = vlq(0) + vlq(0 - prev_src_idx) + vlq(m["srcLine"] - prev_src_line) + vlq(m["srcCol"] - prev_src_col)
		lines[m["genLine"]] = seg
		prev_src_idx = 0
		prev_src_line = m["srcLine"]
		prev_src_col = m["srcCol"]
	return ";".join(lines)

static func build_source_map(file, source, mappings):
	return {
		"version": 3,
		"file": file,
		"sources": [source],
		"names": [],
		"mappings": encode_mappings(mappings),
	}
