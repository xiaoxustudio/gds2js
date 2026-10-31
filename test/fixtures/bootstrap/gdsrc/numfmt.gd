static func digits17(n):
	var s = str(n)
	if s.ends_with(".0"):
		s = s.substr(0, s.length() - 2)
	var neg = s.begins_with("-")
	if neg:
		s = s.substr(1)
	if s.length() <= 17:
		return ("-" if neg else "") + s
	var q = int(s.substr(0, 17))
	if int(s[17]) >= 5:
		q += 1
	return ("-" if neg else "") + str(q) + "0".repeat(s.length() - 17)


static func str_float(n):
	if is_nan(n):
		return "nan"
	if is_inf(n):
		return "-inf" if n < 0.0 else "inf"
	if n == 0.0:
		return "0.0"
	if n == floor(n):
		if abs(n) >= 9223372036854775808.0:
			return digits17(n) + ".0"
		return str(int(n)) + ".0"
	var int_digits = max(0, int(floor(log(abs(n)) / log(10.0))) + 1)
	var decimals = max(0, min(14, 15 - int_digits))
	if decimals == 0:
		var r = sign(n) * round(abs(n))
		return str(int(r))
	var trimmed = String.num(n, decimals)
	if trimmed.contains("."):
		trimmed = trimmed.rstrip("0")
	if trimmed.ends_with("."):
		return trimmed + "0"
	return trimmed


static func str_num(n):
	if n == 0.0 and (1.0 / n) < 0.0:
		return "-0.0"
	return str_float(n)


static func str_sci(n):
	if is_nan(n):
		return "nan"
	if is_inf(n):
		return "-inf" if n < 0.0 else "inf"
	if n == 0.0:
		return "0"
	var s = String.num_scientific(n)
	if s.contains("e"):
		return s
	if abs(n) < 1.0:
		var dot = s.find(".")
		if dot >= 0 and s.length() - dot - 1 > 14:
			return {"__error": "numfmt-sci-frac", "message": "|浮点| 小于 1 的长小数印法在引擎侧被截到 14 位，搬不动"}
	return s


static func _js_sig_text(m, decimals):
	var text = String.num(m, decimals)
	if text.contains("."):
		text = text.rstrip("0")
		if text.ends_with("."):
			text = text.substr(0, text.length() - 1)
	return text


static func _js_same(cand, target):
	return load("res://double.gd").parse_gd_double(String(cand)) == target


static func _js_inc_digits(text):
	var arr = []
	for i in range(text.length()):
		arr.append(text.substr(i, 1))
	var i2 = arr.size() - 1
	var carry = 1
	while i2 >= 0 and carry == 1:
		var d = int(arr[i2]) + 1
		if d == 10:
			arr[i2] = "0"
		else:
			arr[i2] = str(d)
			carry = 0
		i2 -= 1
	var out = ""
	if carry == 1:
		out = "1"
	for c in arr:
		out += c
	return out


static func _sci_parts(s):
	var ee = s.find("e")
	if ee < 0:
		return []
	var mant = s.substr(0, ee)
	var ex = int(s.substr(ee + 1))
	var dot = mant.find(".")
	if dot < 0:
		dot = mant.length()
	var all = mant.replace(".", "")
	var lead = 0
	while lead < all.length() and all.substr(lead, 1) == "0":
		lead += 1
	var dg = all.substr(lead)
	while dg.length() > 1 and dg.ends_with("0"):
		dg = dg.substr(0, dg.length() - 1)
	return [dg, ex + dot - 1 - lead]


static func js_num_text(n):
	if is_nan(n):
		return "NaN"
	if is_inf(n):
		return "-Infinity" if n < 0.0 else "Infinity"
	if n == 0.0:
		return "0"
	var neg = n < 0.0
	var target = abs(n)
	var s = str(target)
	var e = 0
	var all = ""
	var dot = -1
	var ee = s.find("e")
	if ee >= 0:
		var mant = s.substr(0, ee)
		e = int(s.substr(ee + 1))
		dot = mant.find(".")
		if dot < 0:
			dot = mant.length()
		all = mant.replace(".", "")
	else:
		dot = s.find(".")
		if dot < 0:
			dot = s.length()
		all = s.replace(".", "")
	var lead = 0
	while lead < all.length() and all.substr(lead, 1) == "0":
		lead += 1
	var digits = all.substr(lead)
	while digits.length() > 1 and digits.ends_with("0"):
		digits = digits.substr(0, digits.length() - 1)
	if digits == "" or digits == "0":
		var sp = _sci_parts(String.num_scientific(target))
		if sp.is_empty():
			return "0"
		digits = sp[0]
		e = sp[1]
	else:
		e += dot - 1 - lead
	if digits.length() < 17:
		var e2 = int(floor(log(target) / log(10.0)))
		var m = target / pow(10.0, e2)
		while m >= 10.0:
			m = m / 10.0
			e2 += 1
		while m < 1.0:
			m = m * 10.0
			e2 -= 1
		var alt = _js_sig_text(m, 16).replace(".", "")
		if alt.length() > digits.length():
			digits = alt
			e = e2
	var red = digits
	for p in range(1, digits.length() + 1):
		var bumped = digits.substr(0, p)
		if p < digits.length() and digits.substr(p, 1) >= "5":
			bumped = _js_inc_digits(bumped)
		var pe = e
		if bumped.length() > p:
			bumped = bumped.substr(0, p)
			pe += 1
		var exp2 = pe - (bumped.length() - 1)
		var cand = bumped + "e" + ("+" if exp2 >= 0 else "-") + str(abs(exp2))
		if _js_same(cand, target):
			red = bumped
			e = pe
			break
	digits = red
	while digits.length() > 1 and digits.ends_with("0"):
		digits = digits.substr(0, digits.length() - 1)
	var nd = digits.length()
	var out = ""
	if e >= -6 and e < 21:
		if e >= nd - 1:
			out = digits + "0".repeat(e - nd + 1)
		elif e >= 0:
			out = digits.substr(0, e + 1) + "." + digits.substr(e + 1)
		else:
			out = "0." + "0".repeat(-e - 1) + digits
	else:
		var mant2 = digits.substr(0, 1)
		if nd > 1:
			mant2 += "." + digits.substr(1)
		out = mant2 + "e" + ("+" if e >= 0 else "-") + str(abs(e))
	return ("-" if neg else "") + out
