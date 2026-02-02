// src/routes/usuarioRoutes.ts
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { crearUsuarioController, getAllUsuariosController } from "../controllers/usuarioController.js";

const router = Router();

const soloAdmin = [
    authenticateToken,
    authorizeRole(["SuperADMIN"])
];

// Crear usuario (solo SuperADMIN)
router.post("/", ...soloAdmin, crearUsuarioController);

// 👉 GET ALL usuarios (solo SuperADMIN)
router.get("/", ...soloAdmin, getAllUsuariosController);


export default router;
