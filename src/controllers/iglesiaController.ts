import { Request, Response } from "express";
import {
    crearIglesiaService,
    getAllIglesiasService,
    editarIglesiaService,
    eliminarIglesiaService,
} from "../services/IglesiaService.js";

export const crearIglesiaController = async (req: Request, res: Response) => {
    try {
        const data = await crearIglesiaService(req.body);
        return res.status(201).json({
            message: "Iglesia creada correctamente",
            data,
        });
    } catch (error: any) {
        const msg = error?.message ?? "Error creando iglesia";
        // 409 si es duplicado, 400 si es validación
        const status = msg.includes("Ya existe") ? 409 : 400;
        return res.status(status).json({ message: msg });
    }
};

export const getAllIglesiasController = async (_: Request, res: Response) => {
    try {
        const data = await getAllIglesiasService();
        return res.json({ message: "Iglesias obtenidas correctamente", data });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener iglesias" });
    }
};

export const editarIglesiaController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await editarIglesiaService(id, req.body);
        return res.json({
            message: "Iglesia actualizada correctamente",
            data,
        });
    } catch (error: any) {
        return res.status(400).json({ message: error?.message ?? "Error editando iglesia" });
    }
};

export const eliminarIglesiaController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await eliminarIglesiaService(id);
        return res.json({ message: "Iglesia eliminada correctamente" });
    } catch (error: any) {
        return res.status(400).json({ message: error?.message ?? "Error eliminando iglesia" });
    }
};
