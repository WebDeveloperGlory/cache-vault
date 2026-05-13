import { ProductCategory } from "@modules/product/domain/entities/product.entity";
import { z } from "zod/v4";

export const CreateProductSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(1000, 'Description can be at most 1000 characters'),
    price: z.number().positive('Price must be a positive number'),
    stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
    category: z.enum(ProductCategory, 'Invalid category'),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    description: z.string().max(1000, 'Description can be at most 1000 characters').optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
    category: z.enum(ProductCategory, 'Invalid category').optional(),
});

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;