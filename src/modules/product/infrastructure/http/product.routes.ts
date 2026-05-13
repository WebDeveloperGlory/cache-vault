import { Router } from "express";
import { ProductController } from "./product.controller";
import { validateRequest } from "@shared/middlewares/validation.middleware";
import { CreateProductSchema, UpdateProductSchema } from "@modules/product/application/dtos/product.dto";
import { authenticate } from "@shared/middlewares/authenticate.middleware";

export const createProductRoutes = (controller: ProductController): Router => {
    const router = Router();

    router.post(
        '/', 
        authenticate,
        validateRequest(CreateProductSchema),
        controller.create
    );
    router.get('/', controller.findAll);
    router.get('/personal', authenticate, controller.findByUser);
    router.get('/category/:id', controller.findByCategory);
    router.get('/:id', controller.findById);
    router.put(
        '/:id',
        authenticate,
        validateRequest(UpdateProductSchema),
        controller.update
    );
    router.delete('/:id', controller.delete);

    return router;
}