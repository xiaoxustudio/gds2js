import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

console.log("k|path.join|" + join("a", "b", "c.txt").split("\\").join("/"));
console.log("k|path.basename|" + basename(join("a", "b", "c.txt")));
console.log("k|path.extname|" + extname("c.txt"));
console.log("k|path.dirname|" + dirname(join("a", "b", "c.txt")).split("\\").join("/"));
console.log("k|path.relative|" + relative(join("a", "b"), join("a", "c")).split("\\").join("/"));
console.log("k|path.resolve|" + String(isAbsolute(resolve("x"))));
console.log("k|path.sep|" + String(sep === "\\" || sep === "/"));
