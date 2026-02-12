export const checkRole = (...allowedRoles) => (req, res, next) => {
    if(!req.user){
        return res.status(401).json({ error: "Não autenticado" });
    }
    if(!allowedRoles.includes(req.user.role)){
        return res.status(403).json({ error: "Acesso negado. Permissão insuficiente"});
    }

    next();
};

export const isAdmin = checkRole("ADMIN");
export const isOperator = checkRole("OPERATOR");
export const isDeliveryMan = checkRole("DELIVERY_MAN");