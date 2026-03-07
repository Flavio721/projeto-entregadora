import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isAdmin } from '../middlewares/roles.js';
import {
    dashboard,
    getBestDrivers,
    getDeliveryPerformance,
    getLogs,
    heatLocations
} from '../controllers/dashboard.controller.js';
import { searchLimiter } from '../configs/rateLimit.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/kpis:
 *   get:
 *     summary: Obter KPIs do dashboard
 *     description: Retorna indicadores chave de performance (pedidos ativos, entregues, taxa de sucesso, etc)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 soma:
 *                   type: integer
 *                   example: 150
 *                   description: Total de pedidos
 *                 count:
 *                   type: integer
 *                   example: 47
 *                   description: Pedidos ativos
 *                 somaDiaria:
 *                   type: integer
 *                   example: 12
 *                   description: Pedidos entregues hoje
 *                 onTimeRate:
 *                   type: number
 *                   format: float
 *                   example: 85.5
 *                   description: Taxa de entregas no prazo (%)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN ou OPERATOR)
 */
router.get('/kpis', searchLimiter, authMiddleware, checkRole("ADMIN", "OPERATOR"), dashboard);

/**
 * @swagger
 * /api/dashboard/ranking:
 *   get:
 *     summary: Ranking dos melhores entregadores
 *     description: Lista dos entregadores com melhor desempenho ordenados por número de entregas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 drivers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: Carlos
 *                       surname:
 *                         type: string
 *                         example: Santos
 *                       totalDeliveries:
 *                         type: integer
 *                         example: 47
 *                       totalEarned:
 *                         type: number
 *                         format: float
 *                         example: 1645.00
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/ranking', searchLimiter, authMiddleware, isAdmin, getBestDrivers);

/**
 * @swagger
 * /api/dashboard/heatmap:
 *   get:
 *     summary: Mapa de calor de entregas por região
 *     description: Retorna estatísticas de entregas agrupadas por região/bairro
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do mapa de calor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 heatmap:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       region:
 *                         type: string
 *                         example: Centro
 *                       count:
 *                         type: integer
 *                         example: 25
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 16.7
 *                 total:
 *                   type: integer
 *                   example: 150
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/heatmap', searchLimiter, authMiddleware, isAdmin, heatLocations);

/**
 * @swagger
 * /api/dashboard/occurrences:
 *   get:
 *     summary: Obter logs e ocorrências do sistema
 *     description: Retorna histórico de eventos e ocorrências importantes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Logs obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: DELIVERY_DELAYED
 *                       description:
 *                         type: string
 *                         example: Entrega #123 atrasada
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-03-06T10:00:00.000Z
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/occurrences', searchLimiter, authMiddleware, isAdmin, getLogs);

/**
 * @swagger
 * /api/dashboard/drivers:
 *   get:
 *     summary: Performance detalhada dos entregadores
 *     description: Retorna estatísticas detalhadas de performance de todos os entregadores
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Performance dos entregadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ranking:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: Carlos
 *                       surname:
 *                         type: string
 *                         example: Santos
 *                       type_vehicle:
 *                         type: string
 *                         example: MOTO
 *                       totalDeliveries:
 *                         type: integer
 *                         example: 47
 *                       avgTime:
 *                         type: number
 *                         format: float
 *                         example: 45.5
 *                         description: Tempo médio de entrega em minutos
 *                       successRate:
 *                         type: number
 *                         format: float
 *                         example: 92.5
 *                         description: Taxa de entregas no prazo (%)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/drivers', searchLimiter, authMiddleware, isAdmin, getDeliveryPerformance);

export default router;