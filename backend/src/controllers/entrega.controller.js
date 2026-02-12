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
export async function assignVehicle(req, res){
    try{
        const orderId = req.query;
        const { nameCar } = req.query;

        const orderExists = await prisma.pedido.findUnique({
            where: { id: orderId }
        });

        if(!orderExists){
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        const vehicleExists = await prisma.veiculo.findFirst({
            where: { nome: nameCar }
        });

        if(!vehicleExists){
            return res.status(404).json({ error: "Veículo não encontrado "});
        }

        if(orderExists.peso > 20 && vehicleExists.tipo === "moto"){
            return res.status(400).json({ error: "Veículo insuficiente para o peso da carga" });
        }

        const updateOrder = await prisma.pedido.update({
            where: { id: orderId },
            data: {
               carro: vehicleExists.id 
            }
        })
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao atribuir veículo "});
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
export async function ordersFilter(req, res){
    try{
        const { status, clientCpf } = req.body;
        
        if(!clientCpf && !status){
            return res.status(400).json({ error: "Campos obrigatórios vázios" });
        }

        if(clientCpf && !status){
            const ordersFound = await prisma.pedido.findMany({
                where: { clientCpf: clientCpf}
            });
        }

        if(status && !clientCpf){
            const ordersFound = await prisma.pedido.findMany({
                where: { status: status}
            });
        }

        else{
            const ordersFound = await prisma.pedido.findMany({
                where: { 
                    status: status,
                    clientCpf: clientCpf
                }
            });
        }
        return res.status(200).json({ 
            message: "Entregas encontradas",
            orders: ordersFound
        });
    }catch (error) {
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro na busca pelos pedidos" });
    }
}

export async function changeStatus(req, res){
    try{
        const { status } = req.body;
        const orderId = req.query;

        const orderExists = await prisma.pedido.findUnique({
            where: { id: orderId }
        });

        if(!orderExists){
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        const updateStatus = await prisma.pedido.update({
            where: { id: orderId },
            data: { 
                status: status
            }
        });

        try{
            const today = new Date();
            const registerChange = await prisma.historico.create({
                data:{
                    note: `Status alterado para ${orderId}`,
                    date: today
                }
            });
        } catch(error){
            console.error("Erro para registrar atualização: ", error);
        }

        return res.status(200).json({ 
            message: "Status atualizado",
            updateStatus
        })
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao alterar status" });
    }
}