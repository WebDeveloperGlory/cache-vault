import { createClient, RedisClientType } from "redis";
import { config } from "./env.config";

export class RedisClient {
    private static instance: RedisClient;
    private client: RedisClientType;

    private constructor() {
        this.client = createClient({
            url: config.redis.url,
        }) as RedisClientType;

        this.client.on("error", (err) => console.error("Redis error:", err));
        this.client.on("reconnecting", () => console.log("Redis reconnecting..."));
    }

    static getInstance(): RedisClient {
        if (!RedisClient.instance) RedisClient.instance = new RedisClient();
        return RedisClient.instance;
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            console.log("✅ Redis connected");

            process.on("SIGINT", async () => { await this.disconnect(); process.exit(0); });
        } catch (error) {
            console.error("❌ Failed to connect to Redis:", error);
            process.exit(1);
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.client.quit();
            console.log("✅ Redis connection closed");
        } catch (error) {
            console.error("Error closing Redis connection:", error);
        }
    }

    getClient(): RedisClientType {
        return this.client;
    }
}

export const redisClient = RedisClient.getInstance();