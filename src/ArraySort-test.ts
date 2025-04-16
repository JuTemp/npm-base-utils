import "./index.js";

const arr = [{ a: 1 }, { a: 2 }, { a: 0 }];

console.log(arr.mySort((i) => i.a));
console.log(arr.mySort((i) => i.a, true));
console.log(arr.mySort((i) => i.a, false));
