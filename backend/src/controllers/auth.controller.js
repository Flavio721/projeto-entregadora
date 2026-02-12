import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export async function registerUser(req, res) {
    try {
        const { name, surname, email, password, cpf, address, phone } = req.body;
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });
        if (existingEmail) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        const existingCpf = await prisma.user.findUnique({
            where: { cpf }
        });
        if (existingCpf) {
            return res.status(400).json({ error: "CPF já cadastrado" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
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

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        delete user.password;

        res.status(201).json({
            message: "Usuário cadastrado",
            user
        });

    } catch (error) {
        res.status(500).json({ error: "Erro ao registrar usuário" });
    }
}
export async function loginUser(req, res){
    try{
        const { email, password } = req.body;
        const userId = req.user.id;

        const userExists = await prisma.user.findUnique({
            where: { id: parseInt(userId)}
        });

        if(!userExists){
            return res.status(404).json({ error: "Cadastro não encontrado" });
        }

        const validPassword = await bcrypt.compare(password, userExists.password);

        if(!validPassword){
            return res.status(403).json({ error: "Email ou senha inválidos" });
        }

        const token = generateToken({
            id: userExists.id,
            email: userExists.email,
            role: userExists.role
        });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV,
            maxAge: 1000 * 60 * 60 * 24
        });
        delete userExists.password;

        return res.status(200).json({
            message: "Login realizado com sucesso",
            user,
            token
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao fazer login" });
    }
}
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