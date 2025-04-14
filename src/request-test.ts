import { request } from "./index.js";

type R = { code: string; data: [{ ts: string }]; msg: string };
const r = (await request("https://www.okx.com/api/v5/public/time")) as R;
console.log(r);

const s = (await request("https://www.okx.com/cdn/assets/imgs/254/EF6F431DA7FFBCA5.ico")) as Buffer;
console.log(s);

const t = (await request("https://www.okx.com/cdn/assets/okfe/okx-nav/common/8475.d11df9bd.css")) as string;
console.log(t);
