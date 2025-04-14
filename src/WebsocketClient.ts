import WebSocket from "ws";

type WebsocketMessageType = string | object;

type OptionsNoHeartbeat = {
    timeout?: number;
};

type Heartbeat = {
    heartbeatInterval: number;
    heartbeatSend: (() => WebsocketMessageType) | WebsocketMessageType;
    heartbeatMessage: ((message: WebsocketMessageType) => boolean) | WebsocketMessageType;
};

export type Options = OptionsNoHeartbeat & Partial<Heartbeat>;

export type onMessageListenerType = (message: WebsocketMessageType) => void;
export type onCloseListenerType = () => void;

export const createWebsocket = async (
    url: ConstructorParameters<typeof WebSocket>[0],
    options: Options = { timeout: 5000 },
    wsConnectOptions?: ConstructorParameters<typeof WebSocket>[1],
): Promise<{
    send: (WebsocketMessage: WebsocketMessageType) => void;
    close: () => void;
    onmessage: (onMessageListener: onMessageListenerType) => void;
    onclose: (onCloseListener: onCloseListenerType) => void;
}> =>
    new Promise(async (resolve, reject) => {
        const { timeout = 5000, heartbeatInterval, heartbeatMessage, heartbeatSend } = options;
        const isHeartbeating =
            heartbeatInterval != null && heartbeatInterval !== 0 && heartbeatSend && heartbeatMessage;
        const ws = wsConnectOptions ? new WebSocket(url, wsConnectOptions) : new WebSocket(url);
        setTimeout(() => reject(`Websocket connect timeout for ${timeout}ms`), timeout);
        await new Promise((resolve) => ws.on("open", resolve));

        const send = (message: WebsocketMessageType) => {
            let data = message.toString();
            try {
                data = JSON.stringify(message);
            } catch {}
            ws.send(data);
        };

        const onCloseSet = new Set<onCloseListenerType>();
        const onclose = (listener: onCloseListenerType) => onCloseSet.add(listener);
        const close = () => ws.close();
        ws.on("close", () => onCloseSet.forEach((listener) => listener()));
        ws.on("error", () => close());

        const onMessageListenerSet = new Set<onMessageListenerType>();
        ws.onmessage = (data) => {
            let message = data.data.toString();
            try {
                message = JSON.parse(data.data.toString());
            } catch {}
            if (isHeartbeating) {
                const heartbeatMessageCheck =
                    typeof heartbeatMessage !== "function"
                        ? (message: WebsocketMessageType) => message === heartbeatMessage
                        : heartbeatMessage;
                heartbeatMessageCheck(message) || onMessageListenerSet.forEach((listener) => listener(message));
            }
        };
        const onmessage = (listener: onMessageListenerType) => onMessageListenerSet.add(listener);

        if (isHeartbeating) {
            const heartbeatSendMessage =
                typeof heartbeatSend === "function" ? (heartbeatSend() as WebsocketMessageType) : heartbeatSend;
            const heartbeatTimer = setInterval(() => send(heartbeatSendMessage), heartbeatInterval);
            ws.onclose = () => {
                clearInterval(heartbeatTimer);
            };
        }

        resolve({
            send,
            close,
            onmessage,
            onclose,
        });
    });
