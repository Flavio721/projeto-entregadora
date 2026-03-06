import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isAdmin, isDeliveryMan, isOperator } from '../middlewares/roles.js';
import { adminOrdersData, assignOrder, assignOrderDetails, createEntrega, getMyOperatingOrders, getMyOrders, getOrders, getTodayOrders } from '../controllers/entrega.controller.js';

const router = express.Router();


// Rotas de obtenção de dados
router.get("/", authMiddleware, isAdmin, getOrders);

// Rota do admin
router.get("/dashboard", authMiddleware, isAdmin, adminOrdersData);
router.post("/create", authMiddleware, isAdmin, createEntrega);

// Rotas do operador
router.get("/my-operating-orders", authMiddleware, isOperator, getMyOperatingOrders);

router.get("/orders-pending", authMiddleware, checkRole("ADMIN", "OPERATOR"), getOrders) // Função que retorna pedidos em espera;
router.post("/select-worker", authMiddleware, isDeliveryMan) // Função que recebe os dados do entregador atribuido
router.get("/orders-today", authMiddleware, isOperator, getTodayOrders);

router.patch("/:id/assign", authMiddleware, isAdmin, assignOrder)

router.patch("/:id/assign/delivery", authMiddleware, isOperator, assignOrderDetails)

// Rotas do entregador
router.get("/my-orders", authMiddleware, isDeliveryMan, getMyOrders) // Função que retorna as entregas atribuidas ao entregador

export default router;