const decoder = new TextDecoder("utf-8", { fatal: true });

export const request = async (url: string | URL): Promise<object | string | Buffer> => {
    const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
    const string = buffer.toString("utf8");
    try {
        return JSON.parse(string);
    } catch {}
    try {
        return decoder.decode(buffer);
    } catch {}
    return buffer;
};
