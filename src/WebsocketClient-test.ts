import { createWebsocket } from "./index.js";

const ws = await createWebsocket("wss://ws.okx.com:8443/ws/v5/public", {
    heartbeatInterval: 20000,
    heartbeatSend: "ping",
    heartbeatMessage: "pong",
});

ws.send({
    op: "subscribe",
    args: [
        {
            channel: "mark-price",
            instId: "BTC-USDT",
        },
    ],
});

ws.onmessage((message) => {
    console.log(message);
});
