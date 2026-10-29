import { isAbsolute } from "node:path";
import { arch, homedir, platform, tmpdir } from "node:os";

console.log("k|os.tmpdir|" + String(isAbsolute(tmpdir())));
console.log("k|os.homedir|" + String(isAbsolute(homedir())));
console.log("k|os.platform|" + String(platform() === "win32" || platform() === "linux" || platform() === "darwin"));
console.log("k|os.arch|" + String(arch().length > 0));
console.log("k|os.env|" + String(Object.keys(process.env).length > 0));
