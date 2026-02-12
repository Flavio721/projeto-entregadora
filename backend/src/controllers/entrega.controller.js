import  { PrismaClient } from "@prisma/client";
import { calculateFrete, calculateValue } from "../utils/calculate";

const prisma = new PrismaClient();

export async function createEntrega(req, res) {
    try {
        const { date, creatorId, status, adress, weight, value } = req.body;

        const finalValue = calculateValue(value, weight);
        const frete = calculateFrete(weight);

        const entrega = await prisma.pedido.create({
            data: {
                estimated_date: date,
                address: adress,
                peso: weight,
                status: status,
                created_by: creatorId,
                valor: finalValue,
                frete: frete
            }
        });

        if(!entrega){
            return res.status(400).json({ error: "Erro ao criar entrega" });
        }

        return res.status(201).json({
            message: "Entrega criada com sucesso",
            entrega
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao criar entrega" });
    }   
}
export async function assignOperator(req, res){
    try{
        const { orderId, operatorId} = req.body;

        const existingOperator = await prisma.user.findUnique({
            where: { id: operatorId},
        });

        if(!existingOperator){
            return res.status(404).json({ error: "Operador não encontrado"});
        }

        const updatedOrder = await prisma.pedido.update({
            where: { id: orderId },
            data: {
                administered_by: operatorId
            }
        });

        return res.status(200).json({
            message: "Operador atribuido",
            updatedOrder
        })
    }catch(error){
        return res.status(500).json({ error: "Erro no sistema" })
    }
}
export async function assignDeliveryMan(req, res){
    try{
        const { orderId, deliveryManId, vehicleId } = req.body;

        const existingOperator = await prisma.user.findUnique({
            where: { id: deliveryManId},
        });

        if(!existingOperator){
            return res.status(404).json({ error: "Entregador não encontrado"});
        }
        
        const existingVehicle = await prisma.veiculo.findUnique({
            where: { id: vehicleId }
        });

        if(!existingVehicle){
            return res.status(404).json({ error: "Veículo não encontrado" })
        }

        const updatedOrder = await prisma.pedido.update({
            where: { id: orderId },
            data: {
                catched_by: deliveryManId
            }
        });

        const updateVehicleStatus = await prisma.veiculo.update({
            where: { id: vehicleId },
            data: {
                status: "UNAVALIABLE"
            }
        });

        return res.status(200).json({
            message: "Entregador atribuido",
            updatedOrder
        })
    }catch(error){
        return res.status(500).json({ error: "Erro no sistema" })
    }
}
export async function uploadOrderImage(req, res){
    try{
        if(!req.file){
            return res.status(400).json({ error: "Imagem não enviada"});
        }

        const orderId = req.query;
        const imagePath = `/uploads/${req.file.filename}`;

        const updateOrder = await prisma.pedido.update({
            where: { id: orderId },
            data:{
                imageUrl: imagePath,
                status: "DELIVERED"
            }
        });

        return res.status(200).json({
            message: "Pedido entregue",
            updateOrder
        });
    }catch (error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro para subir a imagem" });
    }
}