import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import {
    getPastorPerfil,
    getPastorIglesias,
    getPastorMiembros,
    registrarBautismo,
    getPastorBautismos
} from "../services/PastorService.js";
import {
    asignarPastorController,
    quitarPastorController,
    moverPastorController,
    pastoresDeDistritoController,
    crearPastorController,
    pastoresDeAsociacionController,
    estructuraPastoresGlobalController
} from "../controllers/pastorController.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const router = Router();

// Middleware obligatorio
// SOLUCIÓN: Agregamos "SuperADMIN" a la lista de roles permitidos.
const soloPastor = [
    authenticateToken,
    authorizeRole(["PASTOR", "SuperADMIN"]) // Roles permitidos: PASTOR y SuperADMIN
];

const soloAdmin = [
    authenticateToken,
    authorizeRole(["SuperADMIN"])
];

const soloSecretaria = [
    authenticateToken,
    authorizeRole(["SECRETARIAAsociacion", "SuperADMIN"])
];


// 1. Perfil del pastor
router.get("/perfil", ...soloPastor, async (req, res) => {
    // @ts-ignore
    const user = req.user!;
    if (user.rol === 'SuperADMIN') {
        return res.json({
            message: "Perfil de Pastor no disponible para el Super Administrador. Use un token de PASTOR para ver un perfil específico.",
            profileData: null
        });
    }

    const data = await getPastorPerfil(user.referenciaId);

    if (!data) {
        return res.status(404).json({ message: "Perfil de Pastor no encontrado para este usuario." });
    }

    res.json(data);
});

router.get("/by-usuario/:usuarioId", ...soloAdmin, async (req, res) => {
    try {
        const { usuarioId } = req.params;

        const pastor = await prisma.pastor.findUnique({
            where: { usuarioId },
            include: { usuario: true, asociacion: true, distrito: true },
        });

        if (!pastor) return res.status(404).json({ message: "Pastor no existe para este usuario" });

        res.json({ data: pastor });
    } catch (e) {
        res.status(400).json({ message: "Error buscando pastor por usuarioId" });
    }
});


// 2. Iglesias del pastor
router.get("/iglesias", ...soloPastor, async (req, res) => {
    // @ts-ignore
    const user = req.user!;

    if (user.rol === 'SuperADMIN') {
        return res.status(403).json({ message: "La ruta de iglesias es específica por Distrito. Use el token de un PASTOR real." });
    }

    try {
        const data = await getPastorIglesias(user.referenciaId);
        res.json(data);
    } catch (error) {
        // @ts-ignore
        return res.status(400).json({ message: error.message });
    }
});

// 3. Miembros del pastor
router.get("/miembros", ...soloPastor, async (req, res) => {
    // @ts-ignore
    const user = req.user!;

    if (user.rol === 'SuperADMIN') {
        return res.status(403).json({ message: "La ruta de miembros es específica por Distrito. Use el token de un PASTOR real." });
    }

    try {
        const data = await getPastorMiembros(user.referenciaId);
        res.json(data);
    } catch (error) {
        // @ts-ignore
        return res.status(400).json({ message: error.message });
    }
});

// 4. Registrar bautismo
router.post("/bautizar", ...soloPastor, async (req, res) => {
    // @ts-ignore
    const user = req.user!;

    if (user.rol === 'SuperADMIN') {
        return res.status(403).json({ message: "La acción de bautizar debe ser realizada por un PASTOR real." });
    }

    try {
        const data = await registrarBautismo(user.referenciaId, req.body);
        res.json({ message: "Bautismo registrado", data });
    } catch (error) {
        // @ts-ignore
        return res.status(400).json({ message: error.message });
    }
});

// 5. Ver bautismos
router.get("/bautismos", ...soloPastor, async (req, res) => {
    // @ts-ignore
    const user = req.user!;

    if (user.rol === 'SuperADMIN') {
        return res.status(403).json({ message: "La ruta de bautismos es específica por Pastor. Use el token de un PASTOR real." });
    }

    try {
        const data = await getPastorBautismos(user.referenciaId);
        res.json(data);
    } catch (error) {
        // @ts-ignore
        return res.status(400).json({ message: error.message });
    }
});
// Crear pastor
router.post("/", ...soloAdmin, crearPastorController);

// Asignar pastor a distrito
router.post("/asignar", ...soloAdmin, asignarPastorController);

// Quitar pastor del distrito
router.post("/quitar", ...soloAdmin, quitarPastorController);

// Mover pastor a otro distrito
router.post("/mover", ...soloAdmin, moverPastorController);

// Listar pastores del distrito
router.get("/distrito/:distritoId", ...soloSecretaria, pastoresDeDistritoController);

// Listar pastores de la asociación
router.get("/asociacion", ...soloSecretaria, pastoresDeAsociacionController);
//// no me acuerdo si ya esta lista 
router.get("/estructura", ...soloAdmin, estructuraPastoresGlobalController);


export default router;