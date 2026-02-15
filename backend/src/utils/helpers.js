import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient()

async function createAdmin(){ 
    const hashPassword = await bcrypt.hash("password1234", 10);
    const newAdmin = await prisma.user.create({
        data:{
                name: "Flávio",
                surname: "Coelho",
                email: "flavio.admin2@gmail.com",
                password: hashPassword,
                cpf: '761.289.028-10',
                address: 'Rua Aquarius, Jd. Santa Inês',
                phone: '(12) 99645-7871',
                role: "ADMIN"
            }
    })

    const findAdmin = await prisma.user.findUnique({
        where: { email: "flavio.admin2@gmail.com"}
    })
    if(!findAdmin){
        console.log("Não achou");
        return;
    }
    console.log("Achou");
    return;
}
createAdmin()