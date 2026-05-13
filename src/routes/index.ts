import { AuthService } from '@modules/auth/application/services/auth.service';
import { AuthController } from '@modules/auth/infrastructure/http/auth.controller';
import { createAuthRoutes } from '@modules/auth/infrastructure/http/auth.routes';
import { ProductService } from '@modules/product/application/services/product.service';
import { ProductController } from '@modules/product/infrastructure/http/product.controller';
import { createProductRoutes } from '@modules/product/infrastructure/http/product.routes';
import { ProductRepository } from '@modules/product/infrastructure/persistence/product.repository';
import { UserService } from '@modules/user/application/services/user.service';
import { UserController } from '@modules/user/infrastructure/http/user.controller';
import { createUserRoutes } from '@modules/user/infrastructure/http/user.routes';
import { UserRepository } from '@modules/user/infrastructure/persistence/user.interface';
import { Router } from 'express';

export function createRouter(): Router {
    const router = Router();

    // Repositories //
    const userRepo = new UserRepository();
    const productRepo = new ProductRepository();

    // Services //
    const userService = new UserService(
        userRepo,
    );
    const authService = new AuthService(
        userRepo,
    );
    const productService = new ProductService(
        productRepo,
    );

    // Controllers //
    const userController = new UserController(userService);
    const authController = new AuthController(authService);
    const productController = new ProductController(productService);

    // Routes //
    router.use('/user', createUserRoutes(userController));
    router.use('/auth', createAuthRoutes(authController));
    router.use('/product', createProductRoutes(productController));

    return router;
}
