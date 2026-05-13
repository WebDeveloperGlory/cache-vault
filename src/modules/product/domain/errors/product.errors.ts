import { AppError, NotFoundError, ValidationError } from "@shared/errors/app.error";

export class ProductNotFoundError extends NotFoundError {
    constructor(identifier: string) {
        super(`Product with identifier '${identifier}' not found`);
    }
}

export class InvalidProductPermissionsError extends AppError {
    constructor(userId: string) {
        super(`Action not allowed by with identifier: '${userId}'', 401, 'INVALID_CREDENTIALS`);
    }
}

export class InvalidProductCategoryError extends ValidationError {
    constructor(category: string) {
        super(`Invalid filter category: '${category}'`)
    }
}