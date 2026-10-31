const POW10 = [10.0, 100.0, 1e4, 1e8, 1e16, 1e32, 1e64, 1e128, 1e256]
const MAX_EXPONENT = 511

const SP = 32
const TAB = 9
const LF = 10
const PLUS = 43
const MINUS = 45
const DOT = 46
const ZERO = 48
const UPPER_E = 69
const LOWER_E = 101


static func code_at(s, at):
	if at < 0 or at >= s.length():
		return -1
	return s.unicode_at(at)


static func digit_of(c):
	if c >= ZERO and c <= ZERO + 9:
		return c - ZERO
	return -1


static func decimal_to_double(s):
	var i = 0
	var c = code_at(s, i)
	while c == SP or c == TAB or c == LF:
		i += 1
		c = code_at(s, i)
	var sign = false
	if c == MINUS:
		sign = true
		i += 1
		c = code_at(s, i)
	elif c == PLUS:
		i += 1
		c = code_at(s, i)
	var start = i
	var mant_size = 0
	var dec_pt = -1
	while true:
		if digit_of(c) < 0:
			if c != DOT or dec_pt >= 0:
				break
			dec_pt = mant_size
		i += 1
		mant_size += 1
		c = code_at(s, i)
	if dec_pt < 0:
		dec_pt = mant_size
	else:
		mant_size -= 1
	var frac_exp = dec_pt - 18 if mant_size > 18 else dec_pt - mant_size
	var size = 18 if mant_size > 18 else mant_size
	if size == 0:
		return -0.0 if sign else 0.0

	var head = 0
	var j = start
	while size > 9:
		var d = code_at(s, j)
		j += 1
		if d == DOT:
			d = code_at(s, j)
			j += 1
		head = 10 * head + digit_of(d)
		size -= 1
	var tail = 0
	while size > 0:
		var d2 = code_at(s, j)
		j += 1
		if d2 == DOT:
			d2 = code_at(s, j)
			j += 1
		tail = 10 * tail + digit_of(d2)
		size -= 1
	var fraction = 1.0e9 * head + tail

	var exp = 0
	var exp_sign = false
	if c == UPPER_E or c == LOWER_E:
		var k = i + 1
		var ec = code_at(s, k)
		if ec == MINUS:
			exp_sign = true
			k += 1
			ec = code_at(s, k)
		elif ec == PLUS:
			k += 1
			ec = code_at(s, k)
		if digit_of(ec) < 0:
			return -fraction if sign else fraction
		while digit_of(ec) >= 0:
			exp = 10 * exp + digit_of(ec)
			k += 1
			ec = code_at(s, k)
	exp = frac_exp - exp if exp_sign else frac_exp + exp
	if exp < 0:
		exp_sign = true
		exp = -exp
	else:
		exp_sign = false
	if exp > MAX_EXPONENT:
		exp = MAX_EXPONENT
	var dbl_exp = 1.0
	var bit = 0
	while exp != 0:
		if (exp & 1) != 0:
			dbl_exp *= POW10[bit]
		exp = exp >> 1
		bit += 1
	fraction = fraction / dbl_exp if exp_sign else fraction * dbl_exp
	return -fraction if sign else fraction


static func parse_gd_double(text):
	return decimal_to_double(text.replace("_", ""))
