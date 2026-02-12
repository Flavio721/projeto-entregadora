import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authValidation } from '../middlewares/validator.js';

const router = express.Router();

router.post("/register", authValidation.register, registerUser);
router.post("/login", authValidation.login, loginUser);
router.get("/me", authMiddleware) // Adicionar função que retorna dados do usuário

export default router;