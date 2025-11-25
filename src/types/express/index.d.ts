import "express";
import { Rol } from "@prisma/client";

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            rol: Rol;
            referenciaId: string;
            iat?: number;
            exp?: number;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export { };
