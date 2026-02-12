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
        const userId = parseInt(req.params.id);
        const { name, surname, email, password, cpf, address, phone } = req.body;
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });
        if (existingEmail && existingEmail.id !== userId) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }
        const existingCpf = await prisma.user.findUnique({
            where: { cpf }
        });
        if (existingCpf && existingCpf.id !== userId) {
            return res.status(400).json({ error: "CPF já cadastrado" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                surname,
                email,
                password: hashedPassword,
                cpf,
                address,
                phone
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