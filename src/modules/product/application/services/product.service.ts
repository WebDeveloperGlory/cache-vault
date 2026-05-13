import { ProductCategory, ProductEntity } from "@modules/product/domain/entities/product.entity";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { PaginatedResult } from "@shared/types/common.types";
import { IProductRepository } from "@modules/product/domain/interfaces/product.repository.interface";
import { InvalidProductCategoryError, InvalidProductPermissionsError, ProductNotFoundError } from "@modules/product/domain/errors/product.errors";
import { productCache } from "@shared/cache/product.cache";
import { IUserRepository } from "@modules/user/domain/interfaces/user.repository.interface";
import { UserNotFoundError } from "@modules/user/domain/errors/user.errors";

interface ProductResponse extends ProductEntity {
    fromCache: boolean;
}

interface ProductCategoryResponse extends PaginatedResult<ProductEntity> {
    categoryViews: number;
    fromCache: boolean;
}

interface AllProductsResponse extends PaginatedResult<ProductEntity> {
    fromCache: boolean;
}

export interface IProductService {
    create(userId: string, dto: CreateProductDto): Promise<ProductEntity>;
    findById(id: string): Promise<ProductEntity>;
    findAll(page: number, limit: number, user?: string): Promise<AllProductsResponse>;
    findByUser(userId: string, page: number, limit: number, category?: ProductCategory): Promise<PaginatedResult<ProductEntity>>;
    findByCategory(category: string, page: number, limit: number): Promise<PaginatedResult<ProductEntity>>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<ProductEntity>;
    delete(id: string): Promise<void>;
}

export class ProductService implements IProductService {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    async create(userId: string, dto: CreateProductDto): Promise<ProductEntity> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new UserNotFoundError(userId);

        await productCache.invalidateByCategory(dto.category);
        return this.productRepository.create({
            ...dto,
            user: userId
        });
    }

    async findById(id: string): Promise<ProductResponse> {
        const cached = await productCache.getById(id);
        if (cached) return { ...JSON.parse(cached), fromCache: true };

        const product = await this.productRepository.findByIdPop(id);
        if (!product) throw new ProductNotFoundError(id);

        await productCache.setById(id, product);
        return { ...product, fromCache: false };
    }

    async findAll(page: number, limit: number, user?: string): Promise<AllProductsResponse> {
        const offset = (page - 1) * limit;
        const filters: { user?: string } = {};
        if (user) filters.user = user;

        const [items, total] = await Promise.all([
            this.productRepository.findAll(limit, offset, filters),
            this.productRepository.count(filters)
        ]);

        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            fromCache: false
        }
    }

    async findByUser(userId: string, page: number, limit: number, category?: ProductCategory): Promise<PaginatedResult<ProductEntity>> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new UserNotFoundError(userId);

        const offset = (page - 1) * limit;
        const filters: { category?: ProductCategory } = {};
        if (category) filters.category = category;

        const [items, total] = await Promise.all([
            this.productRepository.findByUser(userId, limit, offset, filters),
            this.productRepository.count(filters)
        ]);

        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    async findByCategory(category: string, page: number, limit: number): Promise<ProductCategoryResponse> {
        const offset = (page - 1) * limit;
        if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
            throw new InvalidProductCategoryError(category);
        }

        // Get all category ranks in cache and check if category has been ranked
        const catCache = await productCache.getPopularCategories();
        const catInCache = catCache.find(cat => cat.value === category);
        if (catInCache) {
            // Check if category is among the top 3 most popular
            const isCatPopularInCache = catCache.slice(0, 3).find(cat => cat.value === category);
            if (isCatPopularInCache) {
                // Grab items from cache and increment category score
                await productCache.setPopularCategory(category as ProductCategory);
                const cache = await productCache.getByPopularCategory(category as ProductCategory);
                const parsed = JSON.parse(cache) as ProductEntity[];

                if (parsed) {
                    return {
                        data: parsed.slice(offset, offset + limit),
                        total: parsed.length,
                        page,
                        limit,
                        totalPages: Math.ceil(parsed.length / limit),
                        categoryViews: catInCache.score + 1,
                        fromCache: true
                    }
                }
            } else {
                await productCache.invalidateByCategory(category as ProductCategory);
            }
        }

        // Fetch from database
        const [items, total, all] = await Promise.all([
            this.productRepository.findByCategory(category as ProductCategory, limit, offset),
            this.productRepository.count({ category }),
            this.productRepository.findByCategory(category as ProductCategory, 200, 0)
        ]);

        // Save to cache
        await productCache.setPopularCategory(category as ProductCategory);
        await productCache.setByCategory(category as ProductCategory, all);

        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            categoryViews: catInCache ? catInCache.score + 1 : 1,
            fromCache: false
        }
    }

    async update(id: string, userId: string, dto: UpdateProductDto): Promise<ProductEntity> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new UserNotFoundError(userId);

        const product = await this.productRepository.findById(id);
        if (!product) throw new ProductNotFoundError(id);

        if (user.id !== product.user) throw new InvalidProductPermissionsError(userId);

        const updated = await this.productRepository.update(id, dto);
        await productCache.invalidateRelated(id, updated.category, userId);
        return updated;
    }

    async delete(id: string): Promise<void> {
        const product = await this.productRepository.findById(id);
        if (!product) throw new ProductNotFoundError(id);

        await productCache.invalidateRelated(id, product.category, product.name);
        await this.productRepository.delete(id);
    }
}