import  { PrismaClient } from "@prisma/client";
import { calculateFrete, calculateValue } from "../utils/calculate.js";

const prisma = new PrismaClient();

export async function createEntrega(req, res) {
    try {
        const { date, address, weight, value, clientCpf, clientName } = req.body;
        const creatorId = req.user.id;

        const finalValue = calculateValue(value, weight);
        const frete = calculateFrete(weight);

        const entrega = await prisma.pedido.create({
            data: {
                estimated_date: date,
                address: address,
                peso: weight,
                created_by: creatorId,
                valor: finalValue,
                frete: frete,
                clientCpf: clientCpf,
                clientName: clientName
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
export async function assignOrderDetails(req, res){
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
                catched_by: deliveryManId,
                carroId: vehicleId
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
export async function getOrders(req, res){
    try{
        const { status } = req.query;

        const whereClause = {};
        
        if(status){
            whereClause.status = status.toUpperCase();        
        }

        const orders = await prisma.pedido.findMany({
            where: whereClause,
            include: {
                catchedBy: {
                    select: {
                        name: true,
                        surname: true,
                    }
                },
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.status(200).json({ 
            orders,
            count: orders.length 
        });

    }catch (error){
        console.error("Erro ao buscar pedidos:", error);
        return res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
}
export async function getTodayOrders(req, res) {
    try {
        const { status } = req.query;
        
        // ⭐ Definir intervalo do dia (00:00:00 até 23:59:59)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // ⭐ Construir filtro dinamicamente
        const whereClause = {
            delivered_date: {
                gte: startOfDay,
                lte: endOfDay
            }
        };

        // ⭐ Adicionar filtro de status se fornecido
        if (status) {
            whereClause.status = status.toUpperCase();
        }

        // ⭐ Buscar pedidos e contar em uma única query
        const [todayOrders, countOrders] = await Promise.all([
            prisma.pedido.findMany({
                where: whereClause,
                include: {
                    // ⭐ CORRIGIDO: Usar os nomes corretos das relações
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            email: true,
                            role: true
                        }
                    },
                    administeredBy: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            email: true,
                            role: true
                        }
                    },
                    catchedBy: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            email: true,
                            role: true,
                            type_vehicle: true
                        }
                    },
                    carro: {
                        select: {
                            id: true,
                            nome: true,
                            marca: true,
                            tipo: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.pedido.count({
                where: whereClause
            })
        ]);

        return res.json({
            orders: todayOrders,
            count: countOrders
        });

    } catch (error) {
        console.error("Erro ao buscar entregas:", error);
        return res.status(500).json({ error: "Erro ao buscar entregas" });
    }
}