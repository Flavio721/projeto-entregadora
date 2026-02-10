import "dotenv/config"

export default {
  // 1) Localização do seu schema Prisma
  schema: "prisma/schema.prisma",

  // 2) Configuração de migrations (opcional mas recomendado)
  migrations: {
    path: "prisma/migrations",
  },

  // 3) Configuração da conexão com o banco
  datasource: {
    url: process.env.DATABASE_URL,
    // shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL, // se precisar
  },
}
