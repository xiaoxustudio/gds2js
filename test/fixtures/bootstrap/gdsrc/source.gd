const S = preload("res://state.gd")
const ST = preload("res://stmt.gd")
const B = preload("res://builder.gd")


static func parse_source(src):
	var p = S.Parser.new()
	p.boot(src)
	while true:
		if p.at_eof():
			break
		p.flush()
		if p.at_eof():
			break
		ST.parse_statement_line(p, false)
		if p.failed:
			break
		p.flush()
	if p.failed:
		return {"rootNode": empty_root(src), "syntaxErrors": p.issues}
	return {"rootNode": p.b.root(src.length()), "syntaxErrors": p.issues}


static func empty_root(src):
	var b = B.Builder.new()
	b.boot(src)
	return b.root(src.length())
