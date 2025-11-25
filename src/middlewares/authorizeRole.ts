// src/middlewares/authorizeRole.js

import { Request, Response, NextFunction } from "express";

// Definimos un tipo que extiende Request para incluir 'user' y evitar el error de tipado.
// NOTA: Si esto sigue causando problemas en tu entorno (ej: NodeJS sin TypeScript),
// puedes cambiar 'ExtendedRequest' por 'any'.
type ExtendedRequest = Request & {
    user?: {
        id: string;
        rol: string; // Coincide con el enum Rol de Prisma (ej: 'PASTOR', 'MIEMBRO')
        referenciaId: string;
    };
};

/**
 * Middleware para asegurar que el usuario tenga uno de los roles especificados.
 *
 * @param {string[]} requiredRoles - Arreglo de roles permitidos (ej: ["PASTOR", "SuperADMIN"])
 */
export const authorizeRole = (requiredRoles: string[]) => {
    // Usamos ExtendedRequest para tipar la solicitud, asegurando que 'req.user' esté disponible.
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        // 1. Verificar si el objeto de usuario existe (añadido por authenticateToken)
        if (!user || !user.rol) {
            console.log("❌ Error de autenticación: Token válido pero no se adjuntó el rol.");
            return res.status(401).json({ message: "No autenticado o información de rol faltante." });
        }

        const userRoleLower = user.rol.toLowerCase();

        // Convertimos los roles requeridos a minúsculas para una comparación case-insensitive.
        const requiredRolesLower = requiredRoles.map(r => r.toLowerCase());

        // 2. Verificar si el rol del usuario está incluido en los roles requeridos.
        // Usamos la lógica case-insensitive que ya te funcionaba.
        if (requiredRolesLower.includes(userRoleLower)) {
            // Rol autorizado
            next();
        } else {
            // Rol no autorizado
            console.log(`❌ Acceso denegado. Rol del usuario (token): ${user.rol}. Roles requeridos: ${requiredRoles.join(', ')}`);
            return res.status(403).json({ message: "No tienes permiso para acceder a esta ruta." });
        }
    };
};