import express from 'express';
import { 
    deleteUser, 
    getDeliveryMan, 
    getOperators, 
    getUserById, 
    getUsers, 
    updateUser, 
    updateUserData 
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isAdmin, isOperator } from '../middlewares/roles.js';
import { assignTypeVehicle } from '../controllers/veiculos.controller.js';
import { 
    searchLimiter, 
    apiLimiter 
} from '../configs/rateLimit.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários
 *     description: Retorna lista de todos os usuários do sistema
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                   example: 25
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get("/", searchLimiter, authMiddleware, isAdmin, getUsers);

/**
 * @swagger
 * /api/users/operators:
 *   get:
 *     summary: Listar operadores
 *     description: Retorna lista de usuários com role OPERATOR
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de operadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get("/operators", searchLimiter, authMiddleware, isAdmin, getOperators);

/**
 * @swagger
 * /api/users/delivery-man:
 *   get:
 *     summary: Listar entregadores
 *     description: Retorna lista de usuários com role DELIVERY_MAN
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entregadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           pedidosCount:
 *                             type: integer
 *                             example: 47
 *                             description: Quantidade de pedidos entregues
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (ADMIN ou OPERATOR)
 */
router.get("/delivery-man", searchLimiter, authMiddleware, checkRole("ADMIN", "OPERATOR"), getDeliveryMan);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     description: Retorna detalhes de um usuário específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 5
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get("/:id", searchLimiter, authMiddleware, isAdmin, getUserById);

/**
 * @swagger
 * /api/users/update:
 *   post:
 *     summary: Atualizar usuário (método antigo)
 *     description: Atualiza dados de um usuário (usar PATCH /updateData/:id em vez deste)
 *     deprecated: true
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 5
 *               name:
 *                 type: string
 *                 example: João
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post("/update", apiLimiter, authMiddleware, isAdmin, updateUser);

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Deletar usuário
 *     description: Remove um usuário do sistema pelo email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@example.com
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.delete("/delete", apiLimiter, authMiddleware, isAdmin, deleteUser);

/**
 * @swagger
 * /api/users/updateData/{id}:
 *   patch:
 *     summary: Atualizar dados do usuário
 *     description: Atualiza role e/ou status de um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OPERATOR, DELIVERY_MAN]
 *                 example: OPERATOR
 *               user_status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.patch("/updateData/:id", apiLimiter, authMiddleware, isAdmin, updateUserData);

/**
 * @swagger
 * /api/users/deliveries/assign:
 *   post:
 *     summary: Atribuir tipo de veículo a entregador
 *     description: Define o tipo de veículo que um entregador irá utilizar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryManId
 *               - vehicleType
 *             properties:
 *               deliveryManId:
 *                 type: integer
 *                 example: 5
 *               vehicleType:
 *                 type: string
 *                 enum: [MOTO, CARRO, CAMINHAO]
 *                 example: MOTO
 *     responses:
 *       200:
 *         description: Tipo de veículo atribuído com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Entregador não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas OPERATOR)
 */
router.post("/deliveries/assign", apiLimiter, authMiddleware, isOperator, assignTypeVehicle);

export default router;