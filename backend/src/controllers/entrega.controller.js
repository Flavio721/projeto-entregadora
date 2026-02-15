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
        let soma;
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
            count: countOrders,
        });

    } catch (error) {
        console.error("Erro ao buscar entregas:", error);
        return res.status(500).json({ error: "Erro ao buscar entregas" });
    }
}
export async function adminOrdersData(req, res){
    try{
        // ⭐ CORREÇÃO 1: Inicializar variáveis em 0
        let somaTotal = 0;
        let somaDiaria = 0;

        // Definir intervalo do dia
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // ⭐ OTIMIZAÇÃO: Executar queries em paralelo com Promise.all
        const [
            totalOrders,
            todayOrders,
            countTodayOrders,
            activeDrivers,
            onTimeDeliveriesResult
        ] = await Promise.all([
            // 1. Buscar todos os pedidos (para receita total)
            prisma.pedido.findMany({
                select: {
                    valor: true
                }
            }),
            
            // 2. Buscar pedidos de hoje
            prisma.pedido.findMany({
                where: {
                    delivered_date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                select: {
                    valor: true
                }
            }),
            
            // 3. Contar pedidos de hoje
            prisma.pedido.count({
                where: {
                    delivered_date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            }),
            
            // 4. Contar entregadores ativos
            prisma.user.count({
                where: { 
                    status: 'AVALIABLE' // ⚠️ Verificar: está escrito "AVALIABLE" mesmo ou "AVAILABLE"?
                }
            }),
            
            // 5. Contar entregas no prazo (GERAL, não só hoje)
            prisma.$queryRaw`
                SELECT COUNT(*) as count
                FROM "Pedido"
                WHERE status = 'DELIVERED'
                AND delivered_date <= estimated_date
            `
        ]);

        // Calcular receita total
        totalOrders.forEach((order) => {
            somaTotal += order.valor;
        });

        // Calcular receita diária
        todayOrders.forEach((order) => {
            somaDiaria += order.valor;
        });

        // ⭐ CORREÇÃO 2: Converter BigInt para Number
        const onTimeCount = Number(onTimeDeliveriesResult[0].count);

        // Contar total de entregas finalizadas (para calcular taxa)
        const totalDelivered = await prisma.pedido.count({
            where: { status: 'DELIVERED' }
        });

        // Calcular taxa de entrega no prazo (porcentagem)
        const rateOnTimeOrders = totalDelivered > 0 
            ? ((onTimeCount / totalDelivered) * 100).toFixed(2) 
            : 0;

        // Calcular ticket médio
        const totalOrdersCount = totalOrders.length;
        const averageTicket = totalOrdersCount > 0 
            ? (somaTotal / totalOrdersCount).toFixed(2) 
            : 0;

        // ⭐ CORREÇÃO 3: Retornar status 200, não 400
        return res.status(200).json({ 
            today: {
                revenue: parseFloat(somaDiaria.toFixed(2)),
                count: countTodayOrders,
                activeDrivers: activeDrivers
            },
            global: {
                onTimeRate: parseFloat(rateOnTimeOrders),
                averageTicket: parseFloat(averageTicket),
                totalRevenue: parseFloat(somaTotal.toFixed(2)),
                totalOrders: totalOrdersCount
            }
        });

    }catch(error){
        console.error("Erro ao buscar dados admin:", error);
        return res.status(500).json({ error: "Erro ao buscar dados administrativos" });
    }
}