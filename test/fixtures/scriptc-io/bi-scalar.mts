console.log("k|bi.add|" + (12345678901234567890n + 1n).toString());
console.log("k|bi.mod|" + (12345678901234567890n % 1000n).toString());
console.log("k|bi.pow|" + ((-2n) ** 64n).toString());
console.log("k|bi.cmp|" + String(9223372036854775807n > 9223372036854775806n));
console.log("k|bi.and|" + (0xf0f0n & 0x0ff0n).toString(16));
