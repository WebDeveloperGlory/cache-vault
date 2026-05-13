import { Router } from "express";
import { ProductController } from "./product.controller";
import { validateRequest } from "@shared/middlewares/validation.middleware";
import { CreateProductSchema, UpdateProductSchema } from "@modules/product/application/dtos/product.dto";

export const createProductRoutes = (controller: ProductController): Router => {
    const router = Router();

    router.post(
        '/', 
        validateRequest(CreateProductSchema),
        controller.create
    );
    router.get('/', controller.findAll);
    router.get('/category/:id', controller.findByCategory);
    router.get('/:id', controller.findById);
    router.put(
        '/:id', 
        validateRequest(UpdateProductSchema),
        controller.update
    );
    router.delete('/:id', controller.delete);

    return router;
}