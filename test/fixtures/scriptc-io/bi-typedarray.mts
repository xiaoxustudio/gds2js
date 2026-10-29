const b = new BigInt64Array(2);
b[0] = -9223372036854775807n;
b[1] = 42n;
console.log("k|bta.round|" + String(b[0] === -9223372036854775807n));
console.log("k|bta.pair|" + String(b[1]));
console.log("k|bta.max|" + String(new BigUint64Array([18446744073709551615n])[0]));
