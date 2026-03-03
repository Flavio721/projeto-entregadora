import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';


dotenv.config();

const prisma = new PrismaClient();

async function createUsers(){
    try{
        const hashedPasswordAdmin = await bcrypt.hash('admin72', 10)
        const newAdmin = await prisma.user.create({
            data:{
                name: "Flávio",
                surname: "Coelho",
                email: "flavio.admin@gmail.com",
                password: hashedPasswordAdmin,
                cpf: '231.423.109-91',
                address: 'Rua Aquarius, Jd. Santa Inês',
                phone: '(12) 99645-7871',
                role: "ADMIN"
            }
        });

        const hashedPasswordOperator = await bcrypt.hash('operator72', 10);
        const newOperator = await prisma.user.create({
            data: {
                name: "Flávio",
                surname: "Coelho",
                email: "flavio.operator@gmail.com",
                password: hashedPasswordOperator,
                cpf: '423.231.109-91',
                address: 'Rua Aquarius, Jd. Santa Inês',
                phone: '(12) 99645-7871',
                role: 'OPERATOR'
            }
        });


        const hashedPasswordDeliveryMan = await bcrypt.hash('deliveryman72', 10);
        const newDeliveryMan = await prisma.user.create({
            data: {
                name: "Flávio",
                surname: "Coelho",
                email: "flavio.deliveryman@gmail.com",
                password: hashedPasswordDeliveryMan,
                cpf: '109.231.431-91',
                address: 'Rua Aquarius, Jd. Santa Inês',
                phone: '(12) 99645-7871',
                role: 'DELIVERY_MAN'
            }
        });
        if(!newAdmin || !newDeliveryMan || !newOperator){
            console.log("Erro na criação dos usuários")
        }
    }catch(error){
        console.error("Erro: ", error);
    }
}
async function createVehicles(){
    const newCar = await prisma.veiculo.create({
        data: {
            crv: '2567182906',
            nome: "Fiat Fiorino",
            marca: "Fiat",
            tipo: "CAR",
            ano: 2018,
            status: "AVALIABLE",
            capacity: 650,
        }
    })
    const newTruck = await prisma.veiculo.create({
        data: {
            crv: '8172901892',
            nome: "Volkswagen Delivery",
            marca: "Volkswagen",
            tipo: "TRUCK",
            ano: 2021,
            status: "AVALIABLE",
            capacity: 1335,
        }
    })
    const newMotorCycle = await prisma.veiculo.create({
        data: {
            crv: '3291087615',
            nome: "Honda CG 160",
            marca: "Honda",
            tipo: "MOTOCYCLE",
            ano: 2020,
            status: "AVALIABLE",
            capacity: 20,
        }
    })
    
}
createVehicles();