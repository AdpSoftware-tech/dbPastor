import { Request, Response } from "express";
import { login } from "../services/AuthService.js";

/**
 * 🎯 Manejador del endpoint POST /api/auth/login
 */
export const loginHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Se requieren email y password." });
    }

    try {
        const result = await login(email, password);

        // Envía el token, rol y el ID de referencia (para que la app sepa quién es)
        res.status(200).json({
            message: "Login exitoso",
            token: result.token,
            rol: result.rol,
            referenciaId: result.referenciaId,
        });

    } catch (error) {
        // Manejar errores específicos de credenciales y errores internos
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";

        if (errorMessage.includes("Credenciales inválidas")) {
            return res.status(401).json({ message: "Email o contraseña incorrectos." });
        }
        console.error("Error en login:", error);
        return res.status(500).json({ message: "Error interno del servidor durante la autenticación." });
    }
};