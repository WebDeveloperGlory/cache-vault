import { AppError, ConflictError, NotFoundError } from "@shared/errors/app.error";

export class UserAlreadyExistsError extends ConflictError {
    constructor(identifier: string) {
        super(`User with the identifier: '${identifier}' already exists`);
    }
}

export class UserNotFoundError extends NotFoundError {
    constructor(identifier: string | number) {
        super(`User with identifier '${identifier}' not found`);
    }
}


export class InvalidCredentialsError extends AppError {
    constructor(method: string) {
        super(`Invalid ${method} or password', 401, 'INVALID_CREDENTIALS`);
    }
}

export class AccountInactiveError extends AppError {
    constructor(message = 'Account is inactive') {
        super(message, 403, 'ACCOUNT_INACTIVE');
    }
}

export class AccountMissingEmail extends AppError {
    constructor(message = 'Email required on account for resets') {
        super(message, 401, 'INVALID_EMAIL');
    }
}

export class InvalidRefreshTokenError extends AppError {
    constructor(message = 'Invalid or expired refresh token') {
        super(message, 401, 'INVALID_REFRESH_TOKEN');
    }
}

export class RefreshTokenReuseError extends AppError {
    constructor(message = 'Refresh token reuse detected — all sessions invalidated') {
        super(message, 401, 'REFRESH_TOKEN_REUSE');
    }
}