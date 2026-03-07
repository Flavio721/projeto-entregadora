import express from 'express';
import { registerUser, loginUser, createUser, me } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authValidation } from '../middlewares/validator.js';
import { checkRole } from '../middlewares/roles.js';
import { loginLimiter, registerLimiter } from '../configs/rateLimit.js';

const router = express.Router();

router.post("/register", registerLimiter, authValidation.register, registerUser);
router.post("/login", loginLimiter, authValidation.login, loginUser);
router.get("/me", authMiddleware, me) // Adicionar função que retorna dados do usuário
router.post("/create", authMiddleware, checkRole("ADMIN"), authValidation.register, createUser);


export default router;
