import { ProductCategory, ProductEntity } from "../entities/product.entity";

export interface IProductRepository {
    create(data: CreateProductData): Promise<ProductEntity>;
    findById(id: string): Promise<ProductEntity | null>;
    findAll(limit: number, offset: number): Promise<ProductEntity[]>;
    findByUser(userId: string, limit: number, offset: number, filters: Record<string, any>): Promise<ProductEntity[]>;
    findByCategory(cat: ProductCategory, limit: number, offset: number): Promise<ProductEntity[]>;
    update(id: string, data: Partial<CreateProductData>): Promise<ProductEntity>;
    delete(id: string): Promise<void>;
    count(filter: Record<string, any>): Promise<number>;
}

export interface CreateProductData {
    user: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    stock: number;
}