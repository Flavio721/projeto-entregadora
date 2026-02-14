import express from 'express';
import { registerUser, loginUser, createUser } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authValidation } from '../middlewares/validator.js';
import { checkRole } from '../middlewares/roles.js';

const router = express.Router();

router.post("/register", authValidation.register, registerUser);
router.post("/login", authValidation.login, loginUser);
router.get("/me", authMiddleware) // Adicionar função que retorna dados do usuário
router.post("/create", authMiddleware, checkRole("ADMIN"), authValidation.register, createUser);


export default router;
