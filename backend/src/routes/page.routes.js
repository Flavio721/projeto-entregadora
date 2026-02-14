import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { pageAuth } from "../middlewares/pageAuth.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../frontend/pages/auth.html"));
});
router.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../frontend/pages/auth.html"));
});
router.get("/get-token", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../frontend/pages/auth-check.html"));
});

router.get("/dashboardEntregador", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/dashboardEntregador.html"),
  );
});
router.get("/dashboardAdmin", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/dashboardAdmin.html"),
  );
});
router.get("/dashboardOperador", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/dashboardOperador.html"),
  );
});
export default router;