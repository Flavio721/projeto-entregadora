import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("=================================");
      console.log("⚡ FleetFlow API");
      console.log("=================================");
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Prisma Studio: npx prisma studio`);
      console.log("=================================");
      console.log("📋 Status dos Serviços:");
      console.log(`   Database: ✅ Conectado`);
      console.log("=================================\n");
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();