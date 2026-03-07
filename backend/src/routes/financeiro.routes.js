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
} from '../configs/rateLimit.js'; // ⭐ Importar

const router = Router();

router.use(authMiddleware);
router.use(isAdmin);

// ⭐ Relatórios (search limiter - podem ser pesados)
router.get('/summary', searchLimiter, getFinancialSummary);
router.get('/driver-report/:id', searchLimiter, getDriverReport);

// ⭐ Export (API limiter)
router.get('/export', apiLimiter, exportToCSV);

// ⭐ Atualização (API limiter)
router.patch('/payment/:id', apiLimiter, updatePaymentStatus);

export default router;