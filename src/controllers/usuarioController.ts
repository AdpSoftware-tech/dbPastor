// src/controllers/usuarioController.ts
import { Request, Response } from "express";
import { crearUsuario } from "../services/usuarioService.js";
import { Rol } from "@prisma/client";
import { getAllUsuariosService } from "../services/usuarioService.js";

export const crearUsuarioController = async (req: Request, res: Response) => {
    try {
        const {
            nombre,
            apellidos,
            email,
            telefono,
            password,
            rol,
            codigoUnico,
            asociacionId,
            iglesiaId
        } = req.body;

        // Convertir rol a tipo enum Rol (si viene como string)
        const rolValor: Rol = rol as Rol;

        const usuario = await crearUsuario({
            nombre,
            apellidos,
            email,
            telefono,
            password,
            rol: rolValor,
            codigoUnico,
            asociacionId,
            iglesiaId
        });

        return res.status(201).json({
            message: "Usuario creado correctamente",
            data: usuario
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error desconocido al crear usuario.";
        return res.status(400).json({ message });
    }
};



export const getAllUsuariosController = async (req: Request, res: Response) => {
    try {
        const result = await getAllUsuariosService();
        res.json({
            message: "Usuarios obtenidos correctamente",
            data: result.usuarios,
            stats: result.stats,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};


