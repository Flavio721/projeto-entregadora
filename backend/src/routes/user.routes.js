import express from 'express';
import { deleteUser, getDeliveryMan, getUserById, getUsers, updateUser, updateUserData } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isAdmin, isOperator } from '../middlewares/roles.js';
import { assignTypeVehicle } from '../controllers/veiculos.controller.js';

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getUsers);


router.post("/update", authMiddleware, isAdmin, updateUser);
router.delete("/delete", authMiddleware, isAdmin, deleteUser);

router.get("/delivery-man", authMiddleware, checkRole("ADMIN", "OPERATOR"), getDeliveryMan);

router.get("/:id", authMiddleware, isAdmin, getUserById);
router.patch("/updateData/:id", authMiddleware, isAdmin, updateUserData)
router.post("/deliveries/assign", authMiddleware, isOperator, assignTypeVehicle)
export default router;