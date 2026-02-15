import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isOperator } from '../middlewares/roles.js';
import { create, list } from '../controllers/veiculos.controller.js';
const router = express.Router();


// Rotas de obtenção de dados
router.get("/", authMiddleware, checkRole("OPERATOR", "ADMIN"), list);

// Rotas do operador
router.post("/create", authMiddleware, isOperator, create);

export default router;
