import { createClient } from "redis";

const redisMap: { [key: string]: Awaited<ReturnType<ReturnType<typeof createClient>["connect"]>> } = {};

export const createRedis = async (url: string, dbNumber = 0) => {
    if (dbNumber < 0 || dbNumber > 15) throw new Error("Redis dbNumber invalid.");
    if (redisMap[dbNumber]) return redisMap[dbNumber];
    else {
        const redis = await createClient({
            url,
        })
            .on("error", (err) => console.error("Redis Client Error", err))
            .connect();
        redis.select(dbNumber);
        redisMap[dbNumber] = redis;
        return redis;
    }
};

export const createRedisRef = async (
    url: string,
    redisKey: string,
    dbNumber = 0,
): Promise<{
    get: <T>(defaultValue: T) => Promise<string | T>;
    set: (newValue: any) => Promise<void>;
    shift: <T>(newValue: T, defaultValue: T) => Promise<T>;
}> => {
    const redis = await createRedis(url, dbNumber);
    const get = async <T>(defaultValue: T) => {
        const string = await redis.get(redisKey);
        if (string === null) return defaultValue;
        try {
            return JSON.parse(string) as T;
        } catch {
            return string;
        }
    };
    const set = async (newValue: any) => {
        if (!newValue) return;
        try {
            const string = JSON.stringify(newValue);
            redis.set(redisKey, string);
        } catch {
            const string = newValue.toString();
            redis.set(redisKey, string);
        }
    };
    return {
        get,
        set,
        shift: <T>(newValue: T, defaultValue: T) =>
            new Promise<T>(async (resolve) => {
                resolve((await get(defaultValue)) as T);
                set(newValue);
            }),
    };
};

export const stop = () => Promise.all(Object.values(redisMap).map((client) => client.disconnect()));
