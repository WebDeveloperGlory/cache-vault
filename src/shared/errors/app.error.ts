export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string,
        public isOperational: boolean = true,
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') { super(message, 404, 'NOT_FOUND'); }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed') { super(message, 400, 'VALIDATION_ERROR'); }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') { super(message, 401, 'UNAUTHORIZED'); }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN'); }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') { super(message, 409, 'CONFLICT'); }
}

export class ImageUploadError extends AppError {
    constructor(message = 'Image upload failed') { super(message, 400, 'IMAGE_UPLOAD_ERROR'); }
}

export class UnsupportedImageTypeError extends AppError {
    constructor(message = 'Unsupported image type') { super(message, 415, 'UNSUPPORTED_IMAGE_TYPE'); }
}

export class ImageTooLargeError extends AppError {
    constructor(message = 'Image file too large') { super(message, 413, 'IMAGE_TOO_LARGE'); }
}

export class ImageProcessingError extends AppError {
    constructor(message = 'Image processing failed') { super(message, 422, 'IMAGE_PROCESSING_ERROR'); }
}

export class AudioUploadError extends AppError {
    constructor(message = 'Audio upload failed') { super(message, 400, 'AUDIO_UPLOAD_ERROR'); }
}

export class UnsupportedAudioTypeError extends AppError {
    constructor(message = 'Unsupported audio type') { super(message, 415, 'UNSUPPORTED_AUDIO_TYPE'); }
}

export class AudioTooLargeError extends AppError {
    constructor(message = 'Audio file too large') { super(message, 413, 'AUDIO_TOO_LARGE'); }
}

export class AudioProcessingError extends AppError {
    constructor(message = 'Audio processing failed') { super(message, 422, 'AUDIO_PROCESSING_ERROR'); }
}

export class InvalidVerificationTokenError extends AppError {
    constructor(message = 'Invalid verification token') { super(message, 400, 'INVALID_VERIFICATION_TOKEN'); }
}

export class VerificationTokenExpiredError extends AppError {
    constructor(message = 'Verification token has expired') { super(message, 410, 'VERIFICATION_TOKEN_EXPIRED'); }
}

export class InvalidVerificationTokenPurposeError extends AppError {
    constructor(message = 'Invalid verification token purpose') { super(message, 400, 'INVALID_VERIFICATION_TOKEN_PURPOSE'); }
}
