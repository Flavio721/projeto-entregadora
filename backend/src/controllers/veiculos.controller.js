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