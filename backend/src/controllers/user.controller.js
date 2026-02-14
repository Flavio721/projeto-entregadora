import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUsers(req, res) {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter usuários" });
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
export async function me(req, res){
    try{
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                cpf: true,
                address: true,
                phone: true,
                role: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter informações do usuário" });
    }
}
export async function deleteUser(req, res){
    try{
        const { emailUser }= req.body;

        const existingEmail = await prisma.user.findUnique({
            where: { email: emailUser}
        });

        if(!existingEmail){
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        const userDeleted = await prisma.user.delete({
            where: { email: emailUser}
        });

        return res.json({ message: "Usuário deletado" });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao deletar usuário" });
    }
}