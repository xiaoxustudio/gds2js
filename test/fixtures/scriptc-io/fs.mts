import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = join(tmpdir(), "gds2js-io-probe");
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const file = join(dir, "a.txt");
writeFileSync(file, "gds2js");
console.log("k|fs.exists|" + String(existsSync(file)));
console.log("k|fs.size|" + String(statSync(file).size));
console.log("k|fs.read|" + String(readFileSync(file, "utf8")));
writeFileSync(file, new Uint8Array([1, 2, 3]));
const back = readFileSync(file);
console.log("k|fs.bytetype|" + String(back instanceof Uint8Array));
console.log("k|fs.bytesum|" + String(back.reduce((a, b) => a + b, 0)));
console.log("k|fs.readdir|" + String(readdirSync(dir).length));
rmSync(dir, { recursive: true, force: true });
console.log("k|fs.gone|" + String(!existsSync(dir)));
