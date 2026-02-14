import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next){
    try{
        const authHeaders = req.headers.authorization;

        if(!authHeaders){
            return res.status(401).json({ error: "Token não fornecido" });
        }

        const parts = authHeaders.split(" ");

        if(parts.length !== 2 || parts[0] !== "Bearer"){
            return res.status(401).json({ error: "Formato de token inválido" });
        }

        const token = parts[1];
        const decoded = verifyToken(token);

        if(!decoded){
            return res.status(401).json({ error: "Token inválido ou expirado" });
        }

        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({ error: "Falha na autenticação" });
    }
}
