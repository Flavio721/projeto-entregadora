import { verifyToken } from "../utils/jwt.js";

export function pageAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("Token vazio")
    return res.redirect("/login");
  }

  try {
    const decoded = verifyToken(token);
    if(!decoded){
      console.log("Token inválido")
      return res.redirect("/login");
    }
    req.user = decoded;
    next();
  } catch(error) {
    console.log("Erro: ", error);
    return res.redirect("/login");
  }
}