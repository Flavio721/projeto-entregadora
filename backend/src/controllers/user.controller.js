import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: currentUserId
                }
            },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                cpf: true,
                address: true,
                phone: true,
                user_status: true,
                role: true,
                status: true,
                type_vehicle: true,
                // ⭐ Trazer todas as contagens
                _count: {
                    select: {
                        administeredPedidos: true,  // Para OPERATOR
                        catchedPedidos: true        // Para DELIVERY_MAN
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });
        
        // ⭐ Processar usuários e adicionar contagem baseada no role
        const usersWithStats = users.map(user => {
            let pedidosCount = 0;
            
            if (user.role === 'OPERATOR') {
                pedidosCount = user._count.administeredPedidos;
            } else if (user.role === 'DELIVERY_MAN') {
                pedidosCount = user._count.catchedPedidos;
            }
            
            // Remover _count e adicionar pedidosCount
            const { _count, ...userData } = user;
            
            return {
                ...userData,
                pedidosCount
            };
        });
        
        return res.status(200).json({ 
            users: usersWithStats,
            count: usersWithStats.length 
        });
        
    } catch (error) {
        console.error("Erro ao obter usuários:", error);
        return res.status(500).json({ error: "Erro ao obter usuários" });
    }  
}

export async function getUserById(req, res) {
    try { 
        const userId = parseInt(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter usuário" });
    }
}

export async function updateUser(req, res) {
    try {
        const { email, newEmail, funcao, status } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                email: newEmail,
                role: funcao,
                user_status: status
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }  
}
export async function deleteUser(req, res){
    try{
        const { email }= req.body;

        const existingEmail = await prisma.user.findUnique({
            where: { email: email}
        });

        if(!existingEmail){
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        const userDeleted = await prisma.user.delete({
            where: { email: email}
        });

        return res.json({ message: "Usuário deletado" });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao deletar usuário" });
    }
}
export async function getDeliveryMan(req, res){
    try{
        const drivers = await prisma.user.findMany({
            where: { role: "DELIVERY_MAN"},
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                type_vehicle: true,
                _count: {
                    select: {
                        catchedPedidos: true
                    }
                }
            }
        });

        return res.status(200).json({
            users: drivers
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao buscar entregadores" });
    }
}
export async function updateUserData(req, res){
    try{
        const { id } = req.params; // ⭐ Pegar do params, não query
        const { role, user_status } = req.body;

        // Validar ID
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Verificar se usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if(!existingUser){
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        // ⭐ Construir objeto de atualização dinamicamente
        const updateData = {};
        
        if (role) {
            // Validar role
            const validRoles = ['ADMIN', 'OPERATOR', 'DELIVERY_MAN'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: "Role inválido" });
            }
            updateData.role = role;
        }
        
        if (user_status) {
            // Validar status
            const validStatuses = ['ACTIVE', 'INACTIVE'];
            if (!validStatuses.includes(user_status)) {
                return res.status(400).json({ error: "Status inválido" });
            }
            updateData.user_status = user_status;
        }

        // Verificar se há algo para atualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Nenhum dado para atualizar" });
        }

        // ⭐ Atualizar usuário
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true,
                user_status: true,
                type_vehicle: true
            }
        });

        console.log(`✅ Usuário ${userId} atualizado:`, updateData);

        return res.status(200).json({ 
            message: "Usuário atualizado com sucesso",
            user: updatedUser
        });

    }catch(error){
        console.error("❌ Erro ao atualizar usuário:", error);
        return res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
}