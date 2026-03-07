import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/roles.js';
import {
    getFinancialSummary,
    exportToCSV,
    getDriverReport,
    updatePaymentStatus
} from '../controllers/financeiro.controller.js';
import { 
    searchLimiter, 
    apiLimiter 
} from '../configs/rateLimit.js';

const router = Router();

router.use(authMiddleware);
router.use(isAdmin);

/**
 * @swagger
 * /api/financial/summary:
 *   get:
 *     summary: Resumo financeiro
 *     description: Retorna resumo financeiro com filtros opcionais de data e status de pagamento
 *     tags: [Financial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *         example: 2026-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *         example: 2026-12-31
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, CANCELLED]
 *         description: Status de pagamento
 *     responses:
 *       200:
 *         description: Resumo financeiro obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       example: 45320.50
 *                       description: Receita total
 *                     totalFreight:
 *                       type: number
 *                       format: float
 *                       example: 12450.00
 *                       description: Total em fretes
 *                     totalDeliveries:
 *                       type: integer
 *                       example: 150
 *                       description: Total de entregas
 *                     pendingPayments:
 *                       type: number
 *                       format: float
 *                       example: 3250.00
 *                       description: Pagamentos pendentes
 *                 deliveries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
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
 *                         example: Carlos Santos
 *                       totalDeliveries:
 *                         type: integer
 *                         example: 47
 *                       totalEarned:
 *                         type: number
 *                         format: float
 *                         example: 1645.00
 *                 dailyRevenue:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2026-03-06
 *                       revenue:
 *                         type: number
 *                         format: float
 *                         example: 850.00
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/summary', searchLimiter, getFinancialSummary);

/**
 * @swagger
 * /api/financial/driver-report/{id}:
 *   get:
 *     summary: Relatório financeiro de um entregador
 *     description: Retorna relatório detalhado de entregas e ganhos de um entregador específico
 *     tags: [Financial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do entregador
 *         example: 5
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
 *         description: Relatório do entregador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 driver:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     name:
 *                       type: string
 *                       example: Carlos
 *                     surname:
 *                       type: string
 *                       example: Santos
 *                     type_vehicle:
 *                       type: string
 *                       example: MOTO
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: 2026-01-01
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: 2026-03-06
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalDeliveries:
 *                       type: integer
 *                       example: 47
 *                     totalEarned:
 *                       type: number
 *                       format: float
 *                       example: 1645.00
 *                     totalWeight:
 *                       type: number
 *                       format: float
 *                       example: 728.5
 *                     averageFreight:
 *                       type: number
 *                       format: float
 *                       example: 35.00
 *                 dailyStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2026-03-06
 *                       deliveries:
 *                         type: integer
 *                         example: 5
 *                       earned:
 *                         type: number
 *                         format: float
 *                         example: 175.00
 *                 deliveries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       404:
 *         description: Entregador não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/driver-report/:id', searchLimiter, getDriverReport);

/**
 * @swagger
 * /api/financial/export:
 *   get:
 *     summary: Exportar dados financeiros para CSV
 *     description: Gera e baixa um arquivo CSV com todos os dados financeiros do período
 *     tags: [Financial]
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
 *         description: Arquivo CSV gerado com sucesso
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename=relatorio-financeiro-2026-03-06.csv
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.get('/export', apiLimiter, exportToCSV);

/**
 * @swagger
 * /api/financial/payment/{id}:
 *   patch:
 *     summary: Atualizar status de pagamento
 *     description: Atualiza o status de pagamento de uma entrega
 *     tags: [Financial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_status
 *             properties:
 *               payment_status:
 *                 type: string
 *                 enum: [PENDING, PAID, CANCELLED]
 *                 description: Novo status de pagamento
 *                 example: PAID
 *     responses:
 *       200:
 *         description: Status de pagamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status de pagamento atualizado com sucesso
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas ADMIN)
 */
router.patch('/payment/:id', apiLimiter, updatePaymentStatus);

export default router;