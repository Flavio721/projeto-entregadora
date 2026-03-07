import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isOperator } from '../middlewares/roles.js';
import { create, list, setVehicle, unassignVehicle } from '../controllers/veiculos.controller.js';
import { 
    searchLimiter, 
    apiLimiter 
} from '../configs/rateLimit.js';

const router = express.Router();

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Listar veículos
 *     description: Retorna lista de todos os veículos cadastrados
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de veículos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (OPERATOR ou ADMIN)
 */
router.get("/", searchLimiter, authMiddleware, checkRole("OPERATOR", "ADMIN"), list);

/**
 * @swagger
 * /api/vehicles/create:
 *   post:
 *     summary: Cadastrar novo veículo
 *     description: Cria um novo veículo no sistema
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crv
 *               - nome
 *               - marca
 *               - tipo
 *               - ano
 *             properties:
 *               crv:
 *                 type: integer
 *                 example: 123456789
 *                 description: Certificado de Registro de Veículo
 *               nome:
 *                 type: string
 *                 example: Honda CG 160
 *               marca:
 *                 type: string
 *                 example: Honda
 *               tipo:
 *                 type: string
 *                 enum: [MOTO, CARRO, CAMINHAO]
 *                 example: MOTO
 *               ano:
 *                 type: integer
 *                 example: 2023
 *     responses:
 *       201:
 *         description: Veículo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Veículo criado com sucesso
 *                 vehicle:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CRV já cadastrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas OPERATOR)
 */
router.post("/create", apiLimiter, authMiddleware, isOperator, create);

/**
 * @swagger
 * /api/vehicles/assign:
 *   post:
 *     summary: Atribuir veículo a pedido
 *     description: Vincula um veículo disponível a um pedido
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - orderId
 *             properties:
 *               vehicleId:
 *                 type: integer
 *                 example: 3
 *               orderId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Veículo atribuído com sucesso
 *       400:
 *         description: Veículo indisponível ou dados inválidos
 *       404:
 *         description: Veículo ou pedido não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas OPERATOR)
 */
router.post("/assign", apiLimiter, authMiddleware, isOperator, setVehicle);

/**
 * @swagger
 * /api/vehicles/unassign:
 *   post:
 *     summary: Desatribuir veículo de pedido
 *     description: Remove vinculação entre veículo e pedido, liberando o veículo
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Veículo desatribuído com sucesso
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas OPERATOR)
 */
router.post("/unassign", apiLimiter, authMiddleware, isOperator, unassignVehicle);

export default router;