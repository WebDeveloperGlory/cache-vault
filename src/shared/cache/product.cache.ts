import { ProductCategory, ProductEntity } from "@modules/product/domain/entities/product.entity";
import { redisClient } from "@shared/config/redis";

const client = redisClient.getClient();

const KEYS = {
    all: "products:all",
    byId: (id: string) => `products:${id}`,
    byCat: (cat: ProductCategory) => `products:${cat}`,
    popular: "popular:categories",
}

const TTL = {
    all: 60,
    byId: 300,
    byCat: 180
}

export const productCache = {
    async getAll(): Promise<ProductEntity[] | null> {
        const response = await client.get(KEYS.all);
        if (response) return JSON.parse(response) as ProductEntity[];
        return null;
    },

    async setById(id: string, data: ProductEntity): Promise<void> {
        await client.json.set(KEYS.byId(id), "$", JSON.stringify(data));
    },

    async setPopularCategory(cat: ProductCategory): Promise<void> {
        await client.zIncrBy(KEYS.popular, 1, cat);
    },

    async setByCategory(cat: ProductCategory, data: ProductEntity[]): Promise<boolean> {
        const popular = await client.zRange(KEYS.popular, 0, 2);
        if (popular.includes(cat)) {
            await client.json.set(KEYS.byCat(cat), "$", JSON.stringify(data));
            return true;
        }
        return false;
    },

    async getPopularCategories(): Promise<{
        value: string;
        score: number;
    }[]> {
        const popular = await client.zRangeWithScores(KEYS.popular, 0, -1);
        return popular.reverse();
    },

    async getByPopularCategory(cat: ProductCategory) {
        return await client.json.get(KEYS.byCat(cat)) as unknown as string;
    },

    async getById(id: string): Promise<string> {
        return await client.json.get(KEYS.byId(id)) as unknown as string;
    },

    async invalidateByCategory(cat: ProductCategory): Promise<void> {
        await client.del(KEYS.byCat(cat));
    },

    async inalidateById(id: string): Promise<void> {
        await client.del(KEYS.byId(id));
    },

    async invalidateRelated(id: string, cat: ProductCategory): Promise<void> {
        await Promise.all([
            await client.del(KEYS.byId(id)),
            await client.del(KEYS.byCat(cat)),
        ])
    }
}