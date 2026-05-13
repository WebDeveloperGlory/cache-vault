import { ForbiddenError } from "@shared/errors/app.error";

export class LoginRateLimitError extends ForbiddenError {
    constructor() {
        super(`Too many login attempts from the same IP`);
    }
}