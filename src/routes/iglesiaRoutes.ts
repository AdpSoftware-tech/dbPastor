import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import {
    getIglesiaPerfil,
    getMiembrosIglesia,
    crearEventoIglesia
} from "../services/IglesiaService.js";
import {
    crearIglesiaController,
    getAllIglesiasController,
    editarIglesiaController,
    eliminarIglesiaController,
} from "../controllers/iglesiaController.js";

const router = Router();

const soloAdmin = [
    authenticateToken,
    authorizeRole(["SuperADMIN"]),
];

const soloSecretariaIglesia = [
    authenticateToken,
    authorizeRole(["SECRETARIAIglesia", "SuperADMIN"])
];

router.get("/perfil", ...soloSecretariaIglesia, async (req, res) => {
    // @ts-ignore
    const user = req.user!;

    const usuarioId = user.id;

    try {
        const data = await getIglesiaPerfil(usuarioId);
        res.json(data);
    } catch (error) {
        // @ts-ignore
        return res.status(404).json({ message: error.message });
    }
});

router.get("/miembros", ...soloSecretariaIglesia, async (req, res) => {
    // @ts-ignore
    const user = req.user!;
    const usuarioId = user.id;

    try {
        const data = await getMiembrosIglesia(usuarioId);
        res.json(data);
    } catch (error) {
        // @ts-ignore
        return res.status(404).json({ message: error.message });
    }
});


router.post("/evento", ...soloSecretariaIglesia, async (req, res) => {
    // @ts-ignore
    const user = req.user!;
    const usuarioId = user.id;

    try {
        const data = await crearEventoIglesia(usuarioId, req.body);
        res.status(201).json({ message: "Evento creado con éxito", data });
    } catch (error) {
        // @ts-ignore
        return res.status(400).json({ message: error.message });
    }
});


// ✅ Crear iglesia
router.post("/", ...soloAdmin, crearIglesiaController);

// (opcional pero recomendado) ✅ Listar iglesias
router.get("/", ...soloAdmin, getAllIglesiasController);

// (opcional) ✅ Editar
router.put("/:id", ...soloAdmin, editarIglesiaController);

// (opcional) ✅ Eliminar

router.delete("/:id", ...soloAdmin, eliminarIglesiaController);

export default router;