import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isDeliveryMan, isOperator } from '../middlewares/roles.js';
import { createEntrega, getOrders, getTodayOrders } from '../controllers/entrega.controller.js';

const router = express.Router();


// Rotas de obtenção de dados
router.get("/", authMiddleware, checkRole("OPERATOR", "ADMIN"), getOrders);

// Rotas do operador
router.post("/create", authMiddleware, isOperator, createEntrega);

router.get("/orders-pending", authMiddleware, isOperator) // Função que retorna pedidos em espera;
router.post("/select-worker", authMiddleware, isDeliveryMan) // Função que recebe os dados do entregador atribuido
router.get("/orders-today", authMiddleware, isOperator, getTodayOrders);


// Rotas do entregador
router.get("/my-orders", authMiddleware, isDeliveryMan) // Função que retorna as entregas atribuidas ao entregador

export default router;