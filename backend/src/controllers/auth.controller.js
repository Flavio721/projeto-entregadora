import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export async function registerUser(req, res) {
    try {
        const { name, surname, email, password, cpf, address, phone, role, typeVehicle } = req.body;
        
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
        const checkVehicle = typeVehicle ? typeVehicle.toUpperCase() : null;

        const user = await prisma.user.create({
            data: {
                name,
                surname,
                email,
                password: hashedPassword,
                cpf,
                address,
                phone,
                role: role,
                type_vehicle: checkVehicle // Vai ser null para ADMIN e OPERATOR
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
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ error: "Erro ao registrar usuário" });
    }
}
export async function loginUser(req, res){
    try{
        const { email, password } = req.body;

        const userExists = await prisma.user.findUnique({
            where: { email: email}
        });

        if(!userExists){
            console.log("Email: ", email)
            return res.status(404).json({ error: "Cadastro não encontrado" });
        }

        const validPassword = await bcrypt.compare(password, userExists.password);

        if(!validPassword){
            return res.status(400).json({ error: "Email ou senha inválidos" });
        }

        const token = generateToken({
            id: userExists.id,
            email: userExists.email,
            role: userExists.role
        });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24
        });
        delete userExists.password;

        return res.status(200).json({
            message: "Login realizado com sucesso",
            user: userExists,
            token
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao fazer login" });
    }
}

export async function createUser(req, res){
    try{
        const { name, surname, email, password, cpf, address, phone, role, typeVehicle } = req.body;

        if(!name || !email || !password || !cpf){
            return res.status(400).json({ error: "Campos obrigatórios vazios"});
        }

        const hashedPassword = bcrypt.hash(password, 10);
        const checkVehicle = typeVehicle ? typeVehicle.toUpperCase() : null;
        const create = await prisma.user.create({
            data: {
                name,
                surname,
                email,
                password: hashedPassword,
                cpf,
                address,
                phone,
                role,
                type_vehicle: checkVehicle
            }
        });

        return res.status(201).json({ 
            message: "Usuário criado",
            create
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao criar usuário" });
    }
}