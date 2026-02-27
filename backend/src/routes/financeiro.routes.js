import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/roles.js';
import {
    getFinancialSummary,
    exportToCSV,
    getDriverReport,
    updatePaymentStatus
} from '../controllers/financeiro.controller.js';

const router = Router();

// Todas as rotas requerem autenticação de ADMIN
router.use(authMiddleware);
router.use(isAdmin);

// GET /api/financial/summary - Resumo financeiro com filtros
router.get('/summary', getFinancialSummary);

// GET /api/financial/export - Exportar dados para CSV
router.get('/export', exportToCSV);

// GET /api/financial/driver-report/:id - Relatório de entregador específico
router.get('/driver-report/:id', getDriverReport);

// PATCH /api/financial/payment/:id - Atualizar status de pagamento
router.patch('/payment/:id', updatePaymentStatus);

export default router;