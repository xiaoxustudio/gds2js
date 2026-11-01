static func lower_int_lit(text):
	var t = text.replace("_", "")
	var neg = t.begins_with("-")
	var body = t.substr(1) if neg else t
	var value = 0
	if body.begins_with("0x") or body.begins_with("0X"):
		value = body.substr(2).hex_to_int()
	elif body.begins_with("0b") or body.begins_with("0B"):
		for i in range(2, body.length()):
			value = value * 2 + (1 if body[i] == "1" else 0)
	elif body.begins_with("0o") or body.begins_with("0O"):
		for i in range(2, body.length()):
			value = value * 8 + body[i].to_int()
	else:
		value = body.to_int()
		var canon = body
		while canon.length() > 1 and canon.begins_with("0"):
			canon = canon.substr(1)
		if str(value) != canon:
			return ("-" if neg else "") + canon
	if neg:
		return -value
	return value


static func strip_amp(text):
	if text.begins_with("&"):
		return text.substr(1)
	return text


static func strip_caret(text):
	if text.begins_with("^"):
		return text.substr(1)
	return text


static func is_hex_run(text):
	if text.length() == 0:
		return false
	for i in text.length():
		var c = text[i]
		if c >= "0" and c <= "9":
			continue
		if c >= "a" and c <= "f":
			continue
		if c >= "A" and c <= "F":
			continue
		return false
	return true


static func escape_error(message):
	return {"code": "string-escape", "message": message}


static func is_error(v):
	return v is Dictionary and v.has("code") and v.has("message")


static func _push_text(parts, text):
	if parts.size() > 0 and typeof(parts[parts.size() - 1]) == TYPE_STRING:
		parts[parts.size() - 1] = parts[parts.size() - 1] + text
	else:
		parts.append(text)


static func unquote(raw):
	if raw.length() < 2 or not (raw.begins_with("\"") or raw.begins_with("'")):
		return raw
	var inner = raw.substr(1, raw.length() - 2)
	var parts = []
	var i = 0
	while i < inner.length():
		var ch = inner[i]
		if ch != "\\":
			var lead = inner.unicode_at(i)
			if lead >= 0xd800 and lead <= 0xdbff and i + 1 < inner.length():
				var trail = inner.unicode_at(i + 1)
				if trail >= 0xdc00 and trail <= 0xdfff:
					_push_text(parts, inner.substr(i, 2))
					i += 2
					continue
			_push_text(parts, ch)
			i += 1
			continue
		i += 1
		if i >= inner.length():
			return escape_error("字符串以孤立反斜杠结尾")
		var e = inner[i]
		if e == "n":
			_push_text(parts, "\n")
		elif e == "t":
			_push_text(parts, "\t")
		elif e == "r":
			_push_text(parts, "\r")
		elif e == "a":
			parts.append(0x07)
		elif e == "b":
			parts.append(0x08)
		elif e == "f":
			parts.append(0x0c)
		elif e == "v":
			parts.append(0x0b)
		elif e == "\\":
			_push_text(parts, "\\")
		elif e == "\"":
			_push_text(parts, "\"")
		elif e == "'":
			_push_text(parts, "'")
		elif e == "u" or e == "U":
			var width = 4 if e == "u" else 6
			var hex = inner.substr(i + 1, width)
			if hex.length() != width or not is_hex_run(hex):
				return escape_error("\\" + e + " 需要恰好 " + str(width) + " 位十六进制，收到 [" + hex + "]")
			parts.append(hex.hex_to_int())
			i += width
		else:
			return escape_error("不支持的字符串转义 \\" + e)
		i += 1
	var out = ""
	var k = 0
	while k < parts.size():
		var v = parts[k]
		if typeof(v) == TYPE_STRING:
			out += v
			k += 1
			continue
		var hi = v
		if hi >= 0xd800 and hi <= 0xdbff:
			var q = parts[k + 1] if k + 1 < parts.size() else null
			if typeof(q) == TYPE_INT and q >= 0xdc00 and q <= 0xdfff:
				out += String.chr(0x10000 + (hi - 0xd800) * 1024 + (q - 0xdc00))
				k += 2
				continue
			return escape_error("\\u" + ("%x" % hi) + " 是孤立的前置代理")
		if hi >= 0xdc00 and hi <= 0xdfff:
			return escape_error("\\u" + ("%x" % hi) + " 是孤立的后续代理")
		if hi == 0 or hi > 0x10ffff:
			out += String.chr(0xfffd)
		else:
			out += String.chr(hi)
		k += 1
	return out
