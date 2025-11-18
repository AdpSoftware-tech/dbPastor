// src/routes/auth.ts

import { Router } from "express";
import { loginHandler } from "../controllers/AuthController.js";

const router = Router();

// 🔑 Ruta de inicio de sesión
router.post("/login", loginHandler);

// router.post("/logout", ...); // Opcional, para invalidar el token en la App (aunque el token expira solo)

export default router;