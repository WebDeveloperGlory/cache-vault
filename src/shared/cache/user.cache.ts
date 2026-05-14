import { UserEntity } from "@modules/user/domain/entities/user.entity";
import { redisClient } from "@shared/config/redis";

const client = redisClient.getClient();

const KEYS = {
    profile: (id: string) => `user:${id}`,
    login: (ip: string) => `login:${ip}`,
}

export const userCache = {
    async setLoginAttempt(ip: string): Promise<number> {
        // const key = await client.set
        const attempts = await client.incr(KEYS.login(ip));
        console.log(attempts)
        if (attempts === 1) {
            await client.expire(KEYS.login(ip), 60);
        }
        return attempts;
    },

    async setProfile(id: string, data: UserEntity): Promise<void> {
        await client.set(
            KEYS.profile(id),
            JSON.stringify(data)
        );
    },

    async getProfile(id: string): Promise<UserEntity | null> {
        const response = await client.get(KEYS.profile(id));
        if (response) return JSON.parse(response) as UserEntity;
        return null;
    },

    async invalidateProfile(id: string): Promise<void> {
        await client.del(KEYS.profile(id));
    }
}