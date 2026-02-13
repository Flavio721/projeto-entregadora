import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { isAdmin, isDeliveryMan, isOperator } from '../middlewares/roles.js';

const router = express.Router();

// Rotas de obtenção de dados
router.get("/orders")

// Rotas do operador
router.get("/orders-pending", authMiddleware, isOperator) // Função que retorna pedidos em espera;
router.post("/select-worker", authMiddleware, isDeliveryMan) // Função que recebe os dados do entregador atribuido

// Rotas do admin
router.post("/select-order", authMiddleware, isOperator) // Função que registra o operador do pedido

// Rotas do entregador
router.get("/my-orders", authMiddleware, isDeliveryMan) // Função que retorna as entregas atribuidas ao entregador
