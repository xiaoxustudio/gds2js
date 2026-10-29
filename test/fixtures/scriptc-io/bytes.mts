const u = new Uint8Array(4);
const dv = new DataView(u.buffer);
dv.setUint32(0, 0x01020304, true);
console.log("k|bytes.le|" + Array.from(u).join(","));
console.log("k|bytes.be|" + String(dv.getUint32(0, false)));

const f = new DataView(new ArrayBuffer(4));
f.setFloat32(0, 1.5, true);
console.log("k|bytes.f32|" + String(f.getFloat32(0, true) === 1.5));
console.log("k|bytes.wrap|" + String(Uint8Array.from([300])[0]));
console.log("k|bytes.slice|" + String(u.slice(1, 3).join(",")));
