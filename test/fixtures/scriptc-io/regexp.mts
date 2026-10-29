const m = /(\d+)-(\d+)/.exec("ab 12-345 cd");
console.log("k|re.test|" + String(/\s+/.test("a b")));
console.log("k|re.groups|" + (m === null ? "null" : `${String(m[0])}/${String(m[1])}/${String(m[2])}/${String(m.index)}`));

const n = /(?<y>\d{4})-(?<mo>\d{2})/.exec("2026-10");
console.log("k|re.named|" + (n === null ? "null" : `${String(n.groups?.["y"])}/${String(n.groups?.["mo"])}`));

const sticky = /ab/gy;
sticky.lastIndex = 1;
const first = String(sticky.test("abab"));
sticky.lastIndex = 2;
console.log("k|re.sticky|" + first + "/" + String(sticky.test("abab")));

console.log("k|re.dollar|" + "2026-10-30".replace(/(\d+)-(\d+)-(\d+)/, "$3/$2/$1"));
console.log("k|re.fn|" + "a1b2".replace(/\d/g, (d: string) => `#${d}`));
console.log("k|re.split|" + String("a,,b".split(/,+/).length));
console.log("k|re.lookbehind|" + String(/(?<=\$)\d+/.test("$12")));
console.log("k|re.dotall|" + String(/a.b/s.test("a\nb")));
console.log("k|re.unicode|" + String(/\p{L}/u.test("é")));
console.log("k|re.matchall|" + String(Array.from("a1b2".matchAll(/[a-z](\d)/g)).length));
let invalid = "no-throw";
try {
  new RegExp("(");
} catch (e) {
  invalid = e instanceof Error ? "throws" : "other";
}
console.log("k|re.invalid|" + invalid);
