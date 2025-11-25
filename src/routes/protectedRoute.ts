import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = Router();


router.get(
    "/solo-pastor",
    authenticateToken,
    authorizeRole(["pastor", "superadmin"]),
    (req, res) => {
        res.json({
            message: "Ruta SOLO para Pastores",
            user: req.user
        });
    }
);

router.get(
    "/solo-secretario",
    authenticateToken,
    authorizeRole(["secretario", "superadmin"]),
    (req, res) => {
        res.json({
            message: "Ruta SOLO para Secretarios",
            user: req.user
        });
    }
);

router.get(
    "/solo-miembro",
    authenticateToken,
    authorizeRole(["miembro", "superadmin"]),
    (req, res) => {
        res.json({
            message: "Ruta SOLO para Miembros",
            user: req.user
        });
    }
);


router.get(
    "/todos-autenticados",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "Usuario autenticado correctamente",
            user: req.user
        });
    }
);

export default router;
