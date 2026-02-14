import express from 'express';
import { deleteUser, getUserById, getUsers, updateUser } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authValidation } from '../middlewares/validator.js';
import { checkRole } from '../middlewares/roles.js';

const router = express.Router();

router.get("/", authMiddleware, checkRole("ADMIN"), getUsers);


router.post("/update", authMiddleware, checkRole("ADMIN"), updateUser);
router.post("/delete", authMiddleware, checkRole("ADMIN"), deleteUser);


router.get("/:id", authMiddleware, checkRole("ADMIN", getUserById));
export default router;