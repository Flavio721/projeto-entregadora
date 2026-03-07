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
} from '../configs/rateLimit.js'; // ⭐ Importar

const router = express.Router();

// ⭐ Listagens/buscas (search limiter)
router.get("/", searchLimiter, authMiddleware, isAdmin, getUsers);
router.get("/operators", searchLimiter, authMiddleware, isAdmin, getOperators);
router.get("/delivery-man", searchLimiter, authMiddleware, checkRole("ADMIN", "OPERATOR"), getDeliveryMan);
router.get("/:id", searchLimiter, authMiddleware, isAdmin, getUserById);

// ⭐ Atualização/exclusão (API limiter)
router.post("/update", apiLimiter, authMiddleware, isAdmin, updateUser);
router.delete("/delete", apiLimiter, authMiddleware, isAdmin, deleteUser);
router.patch("/updateData/:id", apiLimiter, authMiddleware, isAdmin, updateUserData);

// ⭐ Atribuição (API limiter)
router.post("/deliveries/assign", apiLimiter, authMiddleware, isOperator, assignTypeVehicle);

export default router;