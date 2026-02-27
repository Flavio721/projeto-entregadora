import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// RESUMO FINANCEIRO
// ============================================================================
export async function getFinancialSummary(req, res) {
    try {
        const { startDate, endDate, status } = req.query;

        // Validar datas
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Data inicial e final são obrigatórias" });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Filtro base
        const whereClause = {
            status: 'DELIVERED',
            delivered_date: {
                gte: start,
                lte: end
            }
        };

        // Filtro por status de pagamento (se houver)
        if (status) {
            whereClause.payment_status = status;
        }

        // ⭐ BUSCAR ENTREGAS E ENTREGADORES EM PARALELO
        const [deliveries, drivers] = await Promise.all([
            // 1. Entregas do período
            prisma.pedido.findMany({
                where: whereClause,
                include: {
                    catchedBy: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            type_vehicle: true
                        }
                    },
                    carro: {
                        select: {
                            id: true,
                            nome: true,
                            tipo: true
                        }
                    }
                },
                orderBy: {
                    delivered_date: 'desc'
                }
            }),

            // 2. Entregadores com suas estatísticas
            prisma.user.findMany({
                where: {
                    role: 'DELIVERY_MAN' // ⭐ MUITO MAIS SIMPLES!
                },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    type_vehicle: true,
                    catchedPedidos: {
                        where: {
                            status: 'DELIVERED',
                            delivered_date: {
                                gte: start,
                                lte: end
                            }
                        },
                        select: {
                            frete: true
                        }
                    }
                }
            })
        ]);

        // ⭐ CALCULAR RESUMO
        const totalRevenue = deliveries.reduce((sum, d) => sum + d.valor, 0);
        const logisticsCost = deliveries.reduce((sum, d) => sum + d.frete, 0);
        const pendingPayments = deliveries
            .filter(d => d.payment_status === 'PENDING')
            .reduce((sum, d) => sum + d.valor, 0);
        const pendingCount = deliveries.filter(d => d.payment_status === 'PENDING').length;

        // ⭐ PROCESSAR DADOS DOS ENTREGADORES
        const driversStats = drivers
            .map(driver => ({
                id: driver.id,
                name: driver.name,
                surname: driver.surname,
                type_vehicle: driver.type_vehicle || '-',
                totalDeliveries: driver.catchedPedidos.length,
                totalEarned: driver.catchedPedidos.reduce((sum, p) => sum + p.frete, 0)
            }))
            .filter(driver => driver.totalDeliveries > 0) // ⭐ Só quem teve entregas no período
            .sort((a, b) => b.totalEarned - a.totalEarned); // ⭐ Ordenar por faturamento

        // ⭐ FATURAMENTO DIÁRIO (para gráfico)
        const dailyRevenue = {};
        deliveries.forEach(delivery => {
            const date = new Date(delivery.delivered_date).toISOString().split('T')[0];
            if (!dailyRevenue[date]) {
                dailyRevenue[date] = 0;
            }
            dailyRevenue[date] += delivery.valor;
        });

        return res.json({
            summary: {
                totalRevenue,
                logisticsCost,
                pendingPayments,
                pendingCount,
                period: {
                    start: start.toISOString(),
                    end: end.toISOString()
                }
            },
            deliveries: deliveries.map(d => ({
                ...d,
                payment_status: d.payment_status || 'PENDING'
            })),
            drivers: driversStats,
            dailyRevenue
        });

    } catch (error) {
        console.error("❌ Erro ao buscar resumo financeiro:", error);
        return res.status(500).json({ error: "Erro ao buscar dados financeiros" });
    }
}

// ============================================================================
// EXPORTAR PARA CSV
// ============================================================================
export async function exportToCSV(req, res) {
    try {
        const { startDate, endDate } = req.query;

        // Validar datas
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Datas obrigatórias" });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Buscar entregas
        const deliveries = await prisma.pedido.findMany({
            where: {
                status: 'DELIVERED',
                delivered_date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                catchedBy: {
                    select: {
                        name: true,
                        surname: true
                    }
                },
                carro: {
                    select: {
                        nome: true,
                        tipo: true
                    }
                }
            },
            orderBy: {
                delivered_date: 'desc'
            }
        });

        // ⭐ GERAR CSV
        let csv = 'ID,Data,Cliente,CPF,Peso,Veiculo,Entregador,Valor,Frete,Status\n';
        
        deliveries.forEach(d => {
            const date = new Date(d.delivered_date).toLocaleDateString('pt-BR');
            const entregador = d.catchedBy 
                ? `${d.catchedBy.name} ${d.catchedBy.surname}` 
                : 'Não atribuído';
            const veiculo = d.carro?.tipo || '-';
            const status = d.payment_status || 'PENDING';

            csv += `${d.id},"${date}","${d.clientName}","${d.clientCpf}",${d.peso},"${veiculo}","${entregador}",${d.valor},${d.frete},"${status}"\n`;
        });

        // ⭐ ENVIAR ARQUIVO
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="financeiro_${startDate}_${endDate}.csv"`);
        res.send('\uFEFF' + csv); // BOM para UTF-8

    } catch (error) {
        console.error("❌ Erro ao exportar CSV:", error);
        return res.status(500).json({ error: "Erro ao exportar dados" });
    }
}

// ============================================================================
// RELATÓRIO DE ENTREGADOR
// ============================================================================
export async function getDriverReport(req, res) {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const driverId = parseInt(id);
        
        if (isNaN(driverId)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Validar datas
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Datas obrigatórias" });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Buscar entregador
        const driver = await prisma.user.findUnique({
            where: { id: driverId },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
                type_vehicle: true
            }
        });

        if (!driver) {
            return res.status(404).json({ error: "Entregador não encontrado" });
        }

        // Buscar entregas do entregador
        const deliveries = await prisma.pedido.findMany({
            where: {
                catched_by: driverId,
                status: 'DELIVERED',
                delivered_date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                carro: {
                    select: {
                        nome: true,
                        tipo: true
                    }
                }
            },
            orderBy: {
                delivered_date: 'desc'
            }
        });

        // Calcular totais
        const totalDeliveries = deliveries.length;
        const totalEarned = deliveries.reduce((sum, d) => sum + d.frete, 0);
        const totalWeight = deliveries.reduce((sum, d) => sum + d.peso, 0);

        // Agrupar por dia
        const dailyStats = {};
        deliveries.forEach(d => {
            const date = new Date(d.delivered_date).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    count: 0,
                    earned: 0,
                    weight: 0
                };
            }
            dailyStats[date].count++;
            dailyStats[date].earned += d.frete;
            dailyStats[date].weight += d.peso;
        });

        return res.json({
            driver,
            period: {
                start: start.toISOString(),
                end: end.toISOString()
            },
            summary: {
                totalDeliveries,
                totalEarned,
                totalWeight,
                averageFreight: totalDeliveries > 0 ? totalEarned / totalDeliveries : 0
            },
            dailyStats,
            deliveries
        });

    } catch (error) {
        console.error("❌ Erro ao gerar relatório:", error);
        return res.status(500).json({ error: "Erro ao gerar relatório" });
    }
}

// ============================================================================
// ATUALIZAR STATUS DE PAGAMENTO
// ============================================================================
export async function updatePaymentStatus(req, res) {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const pedidoId = parseInt(id);
        
        if (isNaN(pedidoId)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Validar status
        const validStatuses = ['PAID', 'PENDING', 'CANCELLED'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({ error: "Status inválido" });
        }

        // Verificar se pedido existe
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId }
        });

        if (!pedido) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        // Atualizar status
        const updated = await prisma.pedido.update({
            where: { id: pedidoId },
            data: {
                payment_status
            }
        });

        return res.json({
            message: "Status atualizado com sucesso",
            pedido: updated
        });

    } catch (error) {
        console.error("❌ Erro ao atualizar status:", error);
        return res.status(500).json({ error: "Erro ao atualizar status de pagamento" });
    }
}