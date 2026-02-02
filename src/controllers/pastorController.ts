// src/controllers/pastorController.js
import {
    asignarPastorADistrito,
    quitarPastorDeDistrito,
    moverPastorDeDistrito,
    obtenerPastoresDeDistrito,
    crearPastor,
    obtenerPastoresDeAsociacion,
    obtenerEstructuraAsociacionesPastores
} from "../services/PastorService.js";
import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Asignar pastor a distrito
export const asignarPastorController = async (req: Request, res: Response) => {
    try {
        const { pastorId, usuarioId, distritoId } = req.body;

        if (!distritoId) {
            return res.status(400).json({ message: "distritoId es obligatorio" });
        }

        // ✅ ahora permitimos asignar por pastorId O por usuarioId
        if ((!pastorId || pastorId.trim() === "") && (!usuarioId || usuarioId.trim() === "")) {
            return res.status(400).json({ message: "Debes enviar pastorId o usuarioId" });
        }

        const result = await asignarPastorADistrito({
            pastorId: pastorId?.toString(),
            usuarioId: usuarioId?.toString(),
            distritoId: distritoId.toString(),
        });

        res.json({ message: "Pastor asignado correctamente", data: result });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al asignar pastor a distrito";
        return res.status(409).json({ message: errorMessage });
    }
};


// Quitar pastor del distrito
export const quitarPastorController = async (req: Request, res: Response) => {
    try {
        const { pastorId } = req.body;
        const result = await quitarPastorDeDistrito(pastorId);
        res.json({
            message: "Pastor removido del distrito",
            data: result
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al quitar pastor del distrito";
        return res.status(409).json({ message: errorMessage });
    }
};

// Mover pastor a otro distrito
export const moverPastorController = async (req: Request, res: Response) => {
    try {
        const { pastorId, nuevoDistritoId } = req.body;

        const result = await moverPastorDeDistrito(pastorId, nuevoDistritoId);

        res.json({
            message: "Pastor movido al nuevo distrito",
            data: result
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al mover Pastor a otro distrito";
        return res.status(409).json({ message: errorMessage });
    }
};

// Obtener pastores del distrito
export const pastoresDeDistritoController = async (req: Request, res: Response) => {
    try {
        const { distritoId } = req.params;

        const pastores = await obtenerPastoresDeDistrito(distritoId);

        res.json(pastores);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al obtener pastor del distrito";
        return res.status(409).json({ message: errorMessage });
    }
};

// Crear pastor
export const crearPastorController = async (req: Request, res: Response) => {
    try {
        const {
            usuarioId,
            licenciaPastoral,
            fechaOrdenacion,
            asociacionId,
            distritoId
        } = req.body;

        const pastor = await crearPastor({
            usuarioId,
            licenciaPastoral,
            fechaOrdenacion,
            asociacionId,
            distritoId
        });

        res.status(201).json({
            message: "Pastor creado correctamente",
            data: pastor
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error desconocido al crear pastor.";
        res.status(400).json({ message });
    }
};


//Obtener pastores de la asociación
export const pastoresDeAsociacionController = async (req: Request, res: Response) => {
    try {
        const user = req.user!; // viene del token

        // 1. Si es SuperADMIN
        if (user.rol === "SuperADMIN") {
            const { asociacionId } = req.query;

            // a) Si manda ?asociacionId=...
            if (asociacionId && typeof asociacionId === "string") {
                const pastores = await obtenerPastoresDeAsociacion(asociacionId);
                return res.json(pastores);
            }

            // b) Si NO manda asociacionId -> devolver todos los pastores con su asociación
            const pastores = await prisma.pastor.findMany({
                include: {
                    usuario: { select: { nombre: true, apellidos: true, telefono: true } },
                    asociacion: true,
                    distrito: true
                }
            });

            return res.json(pastores);
        }

        // 2. Si es SECRETARIAAsociacion
        if (user.rol === "SECRETARIAAsociacion") {
            const usuarioDB = await prisma.usuario.findUnique({
                where: { id: user.id },
                select: { asociacionId: true }
            });

            if (!usuarioDB || !usuarioDB.asociacionId) {
                throw new Error("El usuario no está asignado a ninguna asociación.");
            }

            const pastores = await obtenerPastoresDeAsociacion(usuarioDB.asociacionId);
            return res.json(pastores);
        }

        // 3. Otros roles no deben llegar aquí
        return res.status(403).json({ message: "No tiene permisos para ver esta información." });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido obtener pastores de la asociación";
        return res.status(409).json({ message: errorMessage });
    }
};

///
/**
 * Pastores de la asociación, todo ordenado y agrupado, no una lista plana desordenada.
 */
export const estructuraPastoresGlobalController = async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        if (user.rol !== "SuperADMIN") {
            return res.status(403).json({ message: "Solo el SuperADMIN puede ver la estructura global." });
        }

        const data = await obtenerEstructuraAsociacionesPastores();

        return res.json(data);
    } catch (error) {
        const msg =
            error instanceof Error
                ? error.message
                : "Error desconocido al obtener estructura de asociaciones y pastores.";
        return res.status(409).json({ message: msg });
    }
};

