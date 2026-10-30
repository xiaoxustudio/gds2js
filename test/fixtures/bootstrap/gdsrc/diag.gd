const SENTENCES = {
	"matchPatternExpr": "Expected expression for match pattern.",
	"matchGuardColon": "Expected \":\" after \"match\" pattern guard.",
	"matchGuardExpr": "Expected expression for pattern guard after \"when\".",
	"matchPatternsColon": "Expected \":\" or \"when\" after \"match\" patterns.",
	"matchSubjectExpr": "Expected expression to test after \"match\".",
	"matchSubjectColon": "Expected \":\" after \"match\" expression.",
	"matchEmptyBlock": "Expected an indented block after \"match\" statement.",
	"parenClose": "Expected closing \")\" after grouping expression.",
	"accGetColonOrParen": "Expected \":\" or \"(\" after \"get\".",
	"accSetParen": "Expected \"(\" after \"set\".",
	"accGetterName": "Expected getter function name after \"=\".",
	"accSetterName": "Expected setter function name after \"=\".",
	"accBlockEnd": "Expected end of indented block for property.",
	"varTypeAfterColon": "Expected type after \":\"",
}


static func sentence(key):
	if SENTENCES.has(key):
		return SENTENCES[key]
	return ""


static func issue(at, row, column, got, expected, context, sentence_text, report_row, code):
	return {
		"at": at,
		"row": row,
		"column": column,
		"got": got,
		"expected": expected,
		"context": context,
		"sentence": sentence_text,
		"reportRow": report_row,
		"code": code,
	}


static func render(it):
	var want = ""
	for i in it["expected"].size():
		if i > 0:
			want += " / "
		want += it["expected"][i]
	return "%s: 期望 %s，实得 %s（%d:%d）" % [it["context"], want, quote(it["got"]), it["reportRow"] + 1, it["column"] + 1]


static func quote(text):
	return "\"" + text + "\""
