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
                type_vehicle: true
                // ⭐ Não incluir password
            },
            orderBy: {
                id: 'asc'
            }
        });
        
        // ⭐ CORREÇÃO: Retornar objeto com propriedade 'users'
        return res.status(200).json({ 
            users,
            count: users.length 
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
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });
        if (existingEmail) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }
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
        const motor_drivers = await prisma.user.findMany({
            where: { 
                type_vehicle: "MOTO",
                role: "DELIVERY_MAN"}
        });
        const cars_drivers = await prisma.user.findMany({
            where: { 
                type_vehicle: "CARRO",
                role: "DELIVERY_MAN"}
        });
        const truck_drivers = await prisma.user.findMany({
            where: { 
                type_vehicle: "CAMINHÃO",
                role: "DELIVERY_MAN"}
        });

        return res.json({
            cars: cars_drivers,
            motor: motor_drivers,
            truck: truck_drivers
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao buscar entregadores" });
    }
}