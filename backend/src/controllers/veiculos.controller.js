import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function create(req, res){
    try{
        const { crv, marca, tipo, ano } = req.body;

        const existingCrv = await prisma.veiculo.findUnique({
            where: { crv: crv }
        });

        if(existingCrv){
            return res.status(400).json({ error: "CRV já registrado" });
        }
        const registerVehicle = await prisma.veiculo.create({
            data: {
                crv,
                marca,
                tipo,
                ano,
            }
        });
        return res.status(201).json({
            message: "Veículo registrado com sucesso!",
            veiculo: registerVehicle
        });
    }catch(error){
        return res.status(500).json({ error: "Erro ao registrar o veículo" })
    }
}
export async function list(req, res){
    try{
        const vehicles = await prisma.veiculo.findMany();

        return res.json({veiculos: vehicles});
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao buscar carros" });
    }
}
export async function setVehicle(req, res){
    try{
        const { deliveryManId, vehicleType } = req.body;

        const driver_exists = await prisma.user.findUnique({
            where: { id: deliveryManId,
                    role: "DELIVERY_MAN"
            }
        });

        if(!driver_exists){
            return res.status(404).json({ error: "Erro ao buscar entregador"});
        }

        const updateDriver = await prisma.user.update({
            where: { id: deliveryManId},
            data: {
                type_vehicle: vehicleType
            }
        });

        return res.status(200).json({
            message: "Veículo atribuido",
            updateDriver
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao atualizar informações do entregador"});
    }
}