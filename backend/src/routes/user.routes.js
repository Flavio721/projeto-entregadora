import express from 'express';
import { deleteUser, getDeliveryMan, getUserById, getUsers, updateUser } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { checkRole, isAdmin } from '../middlewares/roles.js';

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getUsers);


router.post("/update", authMiddleware, isAdmin, updateUser);
router.delete("/delete", authMiddleware, isAdmin, deleteUser);

router.get("/delivery-man", authMiddleware, checkRole("ADMIN", "OPERATOR"), getDeliveryMan);

router.get("/:id", authMiddleware, checkRole("ADMIN", getUserById));
export default router;