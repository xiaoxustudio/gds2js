import { readFileSync } from "node:fs";
import { Parser, Language } from "web-tree-sitter";

Promise.all([Parser.init(), Language.load("./gdscript.wasm")]).then(
	([_, lang]) => {
		const parser = new Parser();
		parser.setLanguage(lang);

		const tree = parser.parse(readFileSync("examples/test1.gd").toString());
		console.log(tree!.rootNode.toString());
	},
);
