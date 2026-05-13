import { ProductCategory, ProductEntity } from "@modules/product/domain/entities/product.entity";
import { redisClient } from "@shared/config/redis";

interface CachedAllProducts {
    products: ProductEntity[];
    total: number;
}

const client = redisClient.getClient();

const KEYS = {
    all: (page: number, limit: number, version: string) => `products:${version}:all:${page}:${limit}`,
    byId: (id: string) => `products:${id}`,
    byCat: (cat: ProductCategory) => `products:${cat}`,
    byUser: (page: number, limit: number, user: string, version: string) => `products:${version}:user:${user}:${page}:${limit}`,
    productVersion: 'product:cache_version',
    userVersion: 'product:user:cache_version',
    popular: "popular:categories",
}

const TTL = {
    all: 60,
    byId: 300,
    byCat: 180
}

export const productCache = {
    async getAll(page: number, limit: number): Promise<CachedAllProducts | null> {
        const version = await client.get(KEYS.productVersion) || '1';

        const response = await client.get(KEYS.all(page, limit, version));
        if (response) return JSON.parse(response) as CachedAllProducts;
        return null;
    },

    async setProductVersion(): Promise<number> {
        return await client.incr(KEYS.productVersion);
    },

    async setUserVersion(): Promise<number> {
        return await client.incr(KEYS.userVersion);
    },

    async setAll(page: number, limit: number, data: ProductEntity[], total: number): Promise<void> {
        const expanded = { products: data, total };
        const version = await client.get(KEYS.productVersion) || '1';
        await client.json.set(KEYS.all(page, limit, version), "$", JSON.stringify(expanded));
    },

    async setByUser(page: number, limit: number, userId: string, data: ProductEntity, total: number): Promise<void> {
        const expanded = { products: data, total };
        const version = await client.get(KEYS.userVersion) || '1';
        await client.json.set(KEYS.byUser(page, limit, userId, version), "$", JSON.stringify(expanded));
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

    // async invalidateByUser(id: string): Promise<void> {
    //     const version = await client.get(KEYS.productVersion) || '1';
    //     await client.del(KEYS.byUser());
    // },

    async invalidateRelated(id: string, cat: ProductCategory, user: string): Promise<void> {
        await Promise.all([
            await client.del(KEYS.byId(id)),
            await client.del(KEYS.byCat(cat)),
            // await client.del(KEYS.byUser(user)),
        ])
    }
}