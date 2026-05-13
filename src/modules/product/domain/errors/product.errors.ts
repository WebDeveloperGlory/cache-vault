import { NotFoundError, ValidationError } from "@shared/errors/app.error";

export class ProductNotFoundError extends NotFoundError {
    constructor(identifier: string) {
        super(`Product with identifier '${identifier}' not found`);
    }
}

export class InvalidProductCategoryError extends ValidationError {
    constructor(category: string) {
        super(`Invalid filter category: '${category}'`)
    }
}