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

// ⭐ Listagens/buscas (search limiter)
router.get("/", searchLimiter, authMiddleware, isAdmin, getOrders);
router.get("/dashboard", searchLimiter, authMiddleware, isAdmin, adminOrdersData);
router.get("/my-operating-orders", searchLimiter, authMiddleware, isOperator, getMyOperatingOrders);
router.get("/orders-pending", searchLimiter, authMiddleware, checkRole("ADMIN", "OPERATOR"), getOrders);
router.get("/orders-today", searchLimiter, authMiddleware, isOperator, getTodayOrders);
router.get("/my-orders", searchLimiter, authMiddleware, isDeliveryMan, getMyOrders);

// ⭐ Criação/atualização (API limiter)
router.post("/create", apiLimiter, authMiddleware, isAdmin, createEntrega);
router.patch("/:id/assign", apiLimiter, authMiddleware, isAdmin, assignOrder);
router.patch("/:id/assign/delivery", apiLimiter, authMiddleware, isOperator, assignOrderDetails);

// ⭐ Upload (upload limiter)
router.patch(
  "/finish-order/:id",
  uploadLimiter,
  authMiddleware,
  isDeliveryMan,
  upload.single("proof"),
  finishOrder
);

// ⭐ Rota sem controller - REMOVER ou implementar
// router.post("/select-worker", authMiddleware, isDeliveryMan)

export default router;