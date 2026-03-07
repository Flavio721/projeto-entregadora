import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isOperator } from '../middlewares/roles.js';
import { create, list, setVehicle, unassignVehicle } from '../controllers/veiculos.controller.js';
import { 
    searchLimiter, 
    apiLimiter 
} from '../configs/rateLimit.js'; // ⭐ Importar

const router = express.Router();

// ⭐ Listagem (search limiter)
router.get("/", searchLimiter, authMiddleware, checkRole("OPERATOR", "ADMIN"), list);

// ⭐ Criação/atribuição (API limiter)
router.post("/create", apiLimiter, authMiddleware, isOperator, create);
router.post("/assign", apiLimiter, authMiddleware, isOperator, setVehicle);
router.post("/unassign", apiLimiter, authMiddleware, isOperator, unassignVehicle);

export default router;