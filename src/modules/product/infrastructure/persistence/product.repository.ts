import { ProductCategory, ProductEntity } from "@modules/product/domain/entities/product.entity";
import { CreateProductData, IProductRepository } from "@modules/product/domain/interfaces/product.repository.interface";
import { ProductDocument, ProductModel } from "./product.model";
import { ProductNotFoundError } from "@modules/product/domain/errors/product.errors";

export class ProductRepository implements IProductRepository {
    async create(data: CreateProductData): Promise<ProductEntity> {
        const product = await ProductModel.create(data);
        return this.toEntity(product);
    }

    async findById(id: string): Promise<ProductEntity | null> {
        const product = await ProductModel.findById(id);
        return product ? this.toEntity(product) : null;
    }

    async findAll(limit: number, offset: number): Promise<ProductEntity[]> {
        const products = await ProductModel.find().skip(offset).limit(limit);
        return products.map(this.toEntity);
    }

    async findByCategory(cat: ProductCategory, limit: number, offset: number): Promise<ProductEntity[]> {
        const products = await ProductModel.find({ category: cat }).skip(offset).limit(limit);
        return products.map(this.toEntity);
    }
    
    async update(id: string, data: Partial<CreateProductData>): Promise<ProductEntity> {
        const product = await ProductModel.findByIdAndUpdate(id, data, { new: true });
        if(!product) throw new ProductNotFoundError(id);
        return this.toEntity(product);
    }

    async delete(id: string): Promise<void> {
        await ProductModel.findByIdAndDelete(id);
    }

    async count(filter: Record<string, any>): Promise<number> {
        return await ProductModel.countDocuments(filter);
    }

    private toEntity(doc: ProductDocument): ProductEntity {
        return {
            id: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            price: doc.price,
            category: doc.category,
            stock: doc.stock,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }
    }
}