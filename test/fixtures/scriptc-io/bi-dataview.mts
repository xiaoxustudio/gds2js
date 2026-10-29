const dv = new DataView(new ArrayBuffer(8));
dv.setBigInt64(0, -9223372036854775807n, true);
console.log("k|bdv.round|" + String(dv.getBigInt64(0, true) === -9223372036854775807n));
console.log("k|bdv.bits|" + dv.getBigUint64(0, true).toString(16));
dv.setBigUint64(0, 255n, true);
console.log("k|bdv.setu|" + String(dv.getBigUint64(0, true) === 255n));
