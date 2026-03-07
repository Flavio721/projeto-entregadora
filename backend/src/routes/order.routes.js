import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isAdmin, isDeliveryMan, isOperator } from '../middlewares/roles.js';
import { 
    adminOrdersData, 
    assignOrder, 
    assignOrderDetails, 
    createEntrega, 
    finishOrder, 
    getMyOperatingOrders, 
    getMyOrders, 
    getOrders, 
    getTodayOrders 
} from '../controllers/entrega.controller.js';
import upload from '../configs/multer.js';
import { 
    searchLimiter, 
    apiLimiter, 
    uploadLimiter 
} from '../configs/rateLimit.js'; // ⭐ Importar

const router = express.Router();

// routes/orders.routes.js

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar todos os pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CREATED, PENDING, IN_DELIVERY, DELIVERED]
 *         description: Filtrar por status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 count:
 *                   type: integer
 *                   example: 25
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get("/", searchLimiter, authMiddleware, isAdmin, getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obter pedido por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Dados do pedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Pedido não encontrado
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Criar novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - clientCpf
 *               - address
 *               - peso
 *               - valor
 *               - frete
 *             properties:
 *               clientName:
 *                 type: string
 *                 example: Maria Santos
 *               clientCpf:
 *                 type: string
 *                 example: '98765432100'
 *               address:
 *                 type: string
 *                 example: Rua das Flores, 123
 *               peso:
 *                 type: number
 *                 example: 15.5
 *               valor:
 *                 type: number
 *                 example: 250.00
 *               frete:
 *                 type: number
 *                 example: 35.00
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Sem permissão
 */
router.post("/create", apiLimiter, authMiddleware, isAdmin, createEntrega);

/**
 * @swagger
 * /api/orders/{id}/assign:
 *   patch:
 *     summary: Atribuir pedido a um operador
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operatorId
 *             properties:
 *               operatorId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Pedido atribuído com sucesso
 *       404:
 *         description: Pedido ou operador não encontrado
 */
router.patch("/:id/assign", apiLimiter, authMiddleware, isAdmin, assignOrder);

/**
 * @swagger
 * /api/orders/finish-order/{id}:
 *   patch:
 *     summary: Finalizar entrega com comprovante
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - proof
 *             properties:
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Foto do comprovante de entrega
 *     responses:
 *       200:
 *         description: Entrega finalizada com sucesso
 *       400:
 *         description: Comprovante obrigatório
 *       404:
 *         description: Pedido não encontrado
 */
router.patch("/finish-order/:id", uploadLimiter, authMiddleware, isDeliveryMan, upload.single("proof"), finishOrder);

export default router;