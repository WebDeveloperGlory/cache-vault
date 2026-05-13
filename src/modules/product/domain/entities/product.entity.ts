export interface ProductEntity {
    id: string;
    name: string;
    user: string;
    description: string;
    price: number;
    category: ProductCategory;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProductCategory {
    ELECTRONICS = 'electronics',
    BOOKS = 'books',
    CLOTHING = 'clothing',
    HOME = 'home',
    SPORTS = 'sports',
}