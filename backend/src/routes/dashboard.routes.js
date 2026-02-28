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

const router = Router();

router.get('/kpis', authMiddleware, checkRole("ADMIN", "OPERATOR"), dashboard);

router.get('/ranking', authMiddleware, isAdmin, getBestDrivers);

router.get('/heatmap', authMiddleware, isAdmin, heatLocations);

router.get('/occurrences', authMiddleware, isAdmin, getLogs);

router.get('/drivers', authMiddleware, isAdmin, getDeliveryPerformance);

export default router;