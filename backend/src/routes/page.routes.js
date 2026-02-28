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
router.get("/gerenciar-usuarios", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/gerenciarUsuarios.html"),
  );
});
router.get("/financeiro", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/financeiro.html"),
  );
});
router.get("/relatorios", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/relatorios.html"),
  );
});
router.get("/gerenciar-entregadores", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/gerenciarEntregadores.html"),
  );
});
router.get("/gerenciar-veiculos", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/gerenciarVeiculos.html"),
  );
});
router.get("/relatorios-operador", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/relatoriosOperador.html"),
  );
});
router.get("/configs", pageAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../frontend/pages/configuracoes.html"),
  );
});
export default router;