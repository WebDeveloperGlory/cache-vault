import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate } from "@shared/middlewares/authenticate.middleware";

export const createUserRoutes = (controller: UserController): Router => {
    const router = Router();
    router.use(authenticate);

    router.get('/', authenticate, controller.findAll);
    router.get('/:id', controller.findById);

    return router;
}