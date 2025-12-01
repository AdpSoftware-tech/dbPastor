import { Router } from 'express';
import { registrarSuperAdminHandler, registrarSecretariaHandler, registrarSecretariaAsociacionHandler } from '../controllers/RegistroController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

router.post('/admin', registrarSuperAdminHandler);

router.post(
    "/secretaria",
    authenticateToken,
    authorizeRole(["SuperADMIN"]),
    registrarSecretariaHandler
);

router.post(
    "/secretaria-asociacion",
    authenticateToken,
    authorizeRole(["SuperADMIN"]),
    registrarSecretariaAsociacionHandler
);


export default router;