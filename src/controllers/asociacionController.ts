// src/controllers/asociacionController.js
import { Request, Response } from "express";
import {
    crearAsociacion,
    editarAsociacion,
    obtenerAsociacion,
    listarAsociaciones,
    eliminarAsociacion
} from "../services/AsociacionService.js";

// Crear asociación
export const crearAsociacionController = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;
        const nueva = await crearAsociacion(nombre);
        res.status(201).json({ message: "Asociación creada", data: nueva });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

// Editar asociación
export const editarAsociacionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const act = await editarAsociacion(id, nombre);
        res.json({ message: "Asociación actualizada", data: act });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al editar Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

// Obtener una asociación
export const obtenerAsociacionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const asociacion = await obtenerAsociacion(id);
        res.json(asociacion);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al obtener Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

// Listar asociaciones
export const listarAsociacionesController = async (req: Request, res: Response) => {
    try {
        const lista = await listarAsociaciones();
        res.json(lista);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al listas Asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

// Eliminar asociación
export const eliminarAsociacionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await eliminarAsociacion(id);
        res.json({ message: "Asociación eliminada" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido eliminar Asociación.";
        return res.status(409).json({ message: errorMessage });
    }
};
