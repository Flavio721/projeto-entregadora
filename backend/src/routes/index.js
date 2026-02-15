import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import orderRoutes from './order.routes.js';
import vehicleRoutes from './vehicle.routes.js';

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/orders", orderRoutes);
router.use("/vehicles", vehicleRoutes);

export default router;