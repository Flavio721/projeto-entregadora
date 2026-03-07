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

router.get('/kpis', searchLimiter, authMiddleware, checkRole("ADMIN", "OPERATOR"), dashboard);

router.get('/ranking', searchLimiter, authMiddleware, isAdmin, getBestDrivers);

router.get('/heatmap', searchLimiter, authMiddleware, isAdmin, heatLocations);

router.get('/occurrences', searchLimiter, authMiddleware, isAdmin, getLogs);

router.get('/drivers', searchLimiter, authMiddleware, isAdmin, getDeliveryPerformance);

export default router;