import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "@shared/middlewares/authenticate.middleware";
import { validateRequest } from "@shared/middlewares/validation.middleware";
import { ChangePasswordSchema, CreateUserSchema, LoginSchema, LogoutSchema } from "@modules/user/application/dtos/user.dto";

export const createAuthRoutes = (controller: AuthController): Router => {
    const router = Router();

    router.post(
        '/register',
        validateRequest(CreateUserSchema),
        controller.register
    );
    router.post(
        '/login',
        validateRequest(LoginSchema),
        controller.login
    );
    router.post(
        '/logout',
        authenticate,
        validateRequest(LogoutSchema),
        controller.logout
    );
    router.post('/token/refresh', controller.refresh);
    router.get(
        '/me',
        authenticate,
        controller.me
    );
    router.post(
        '/password/change',
        authenticate,
        validateRequest(ChangePasswordSchema),
        controller.changePassword
    );

    return router;
}