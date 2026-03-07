import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import routes from "./src/routes/index.js";
import pageRoutes from "./src/routes/page.routes.js";
import { fileURLToPath } from "url";
import helmet from 'helmet';
import { swaggerSpec } from '../backend/src/configs/swagger.js';
import swaggerUi from 'swagger-ui-express';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(helmet({
      contentSecurityPolicy: false // Desabilitar CSP para Swagger UI funcionar
}));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));


// Endpoint para baixar spec
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #FF6B35; }
        .swagger-ui .opblock-tag { border-left: 4px solid #FF6B35; }
        .swagger-ui .btn.execute { background-color: #FF6B35; border-color: #FF6B35; }
    `,
    customSiteTitle: 'FleetFlow API Docs',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true, // ⭐ Manter token após reload
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
    }
}));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use("/api", routes);
app.use("/", pageRoutes);


export default app;