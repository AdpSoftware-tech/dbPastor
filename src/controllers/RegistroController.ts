
import { Request, Response } from 'express';
import { Rol } from '@prisma/client';
import { registrarUsuario, registrarSuperAdmin } from '../services/RegistroService.js';

export const registrarSuperAdminHandler = async (req: Request, res: Response) => {
    const { nombre, apellidos, email, telefono, password } = req.body;

    if (!nombre || !apellidos || !email || !telefono || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios: nombre, apellidos, email, telefono, password." });
    }

    try {
        const admin = await registrarSuperAdmin({
            nombre, apellidos, email, telefono, password,
            rol: Rol.SuperADMIN,

        });

        res.status(201).json({
            message: "SuperADMIN registrado exitosamente. Ya puede iniciar sesión.",
            usuarioId: admin.id,
            email: admin.email
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al registrar el Admin.";
        return res.status(409).json({ message: errorMessage });
    }
};
