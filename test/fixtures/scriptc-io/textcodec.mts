const bytes = new TextEncoder().encode("é中");
console.log("k|codec.len|" + String(bytes.length));
console.log("k|codec.round|" + String(new TextDecoder().decode(bytes) === "é中"));
console.log("k|codec.bad|" + String(new TextDecoder().decode(new Uint8Array([0xff, 0xfe])) !== "é中"));
console.log("k|codec.hex|" + String(bytes.every((b) => b >= 0 && b <= 255)));
