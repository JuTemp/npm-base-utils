import { WebSocketServer } from "ws";

export type Options = {
    port: number;
};

export const createWebsocketServer = ({ port }: Options) => {
    const wss = new WebSocketServer({ port });
    return wss;
};
