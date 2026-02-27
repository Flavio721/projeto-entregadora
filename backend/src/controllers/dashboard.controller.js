import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function dashboard(req, res){
    try{
        const dataAllOrders = await prisma.pedido.findMany({
            select: {
                created_at: true,
                estimated_date: true,
                delivered_date: true,
            }
        });
        const allOrders = await prisma.pedido.count();

        const entregasNoPrazo = dataAllOrders.filter(entrega => {
            const estimativa = new Date(entrega.estimated_date);
            const entregaFinal = new Date(entrega.delivered_date);
            return entregaFinal <= estimativa;
        }).length;

        const taxaSucesso = (entregasNoPrazo / allOrders) * 100;

                
        const tempos = dataAllOrders.map(entrega => {
            const criacao = new Date(entrega.created_at);
            const entregaFinal = new Date(entrega.delivered_date);
            return (entregaFinal - criacao) / (1000 * 60); // Minutos
        });

        const tempoMedioMinutos = Math.floor(
            tempos.reduce((sum, t) => sum + t, 0) / tempos.length
        );

        return res.status(200).json({
            kpis: {
                avgDeliveryTime: tempoMedioMinutos,
                totalPackages: allOrders,
                successRate: taxaSucesso
            }
        });
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao buscar os dados"});
    }
}

export async function getBestDrivers(req, res){
    try{
        const drivers = await prisma.user.findMany({
            where: { 
                role: "DELIVERY_MAN"
            },
            select: {
                id: true,
                name: true,
                surname: true,
                _count: {
                    select: {
                        catchedPedidos: true 
                    }
                }
            }
        });

        const driversOrdenados = drivers.sort((a, b) => 
            b._count.catchedPedidos - a._count.catchedPedidos
        );

        return res.status(200).json({
            drivers: driversOrdenados
        });
    }catch (error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao buscar dados dos entregadores"});
    }
}

export async function getLogs(req, res){
    try{
        const logs = await prisma.historico.findMany();

        return res.status(200).json({
            occurrences: logs
        })
    }catch(error){
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro ao buscar histórico"});
    }
}
export async function heatLocations(req, res) {
    try {
        // 1. Buscar todas as entregas
        const deliveries = await prisma.pedido.findMany({
            where: {
                status: 'DELIVERED' // ⭐ Só entregas concluídas
            },
            select: {
                address: true
            }
        });

        if (deliveries.length === 0) {
            return res.json({ heatmap: [] });
        }

        // 2. ⭐ Extrair região/bairro do endereço
        const regioes = {};
        const total = deliveries.length;

        deliveries.forEach(delivery => {
            // Extrair bairro (assumindo formato: "Rua X, 123 - Bairro, Cidade/UF")
            const regiao = extrairRegiao(delivery.address);
            
            if (regioes[regiao]) {
                regioes[regiao]++;
            } else {
                regioes[regiao] = 1;
            }
        });

        // 3. ⭐ Converter para array e calcular percentual
        const heatmap = Object.entries(regioes)
            .map(([regiao, count]) => ({
                region: regiao,
                count: count,
                percentage: ((count / total) * 100).toFixed(2)
            }))
            .sort((a, b) => b.count - a.count); // Ordenar por contagem

        return res.status(200).json({
            heatmap,
            total
        });

    } catch (error) {
        console.error("Erro ao buscar heatmap:", error);
        return res.status(500).json({ error: "Erro ao buscar mapa de calor" });
    }
}

// Função para extrair região do endereço
function extrairRegiao(address) {
    if (!address) return 'Não informado';

    // Formato esperado: "Rua das Flores, 123 - Centro, São Paulo/SP"
    // Extrair o que vem depois do " - " e antes da vírgula
    
    const partes = address.split('-');
    
    if (partes.length > 1) {
        // Pega o que vem depois do "-" e antes da próxima vírgula
        const bairroCompleto = partes[1].trim();
        const bairro = bairroCompleto.split(',')[0].trim();
        return bairro;
    }
    
    // Se não tiver o formato esperado, retorna o endereço inteiro
    return address.split(',')[0].trim();
}
export async function getDeliveryPerformance(req, res) {
    try {
        const { startDate, endDate } = req.query;

        // ⭐ Construir filtro de data (opcional)
        const whereClause = {
            status: 'DELIVERED',
            catched_by: {
                not: null // Só entregas com entregador
            }
        };

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            whereClause.delivered_date = {
                gte: start,
                lte: end
            };
        }

        // 1. Buscar todos os entregadores
        const drivers = await prisma.user.findMany({
            where: {
                role: 'DELIVERY_MAN'
            },
            select: {
                id: true,
                name: true,
                surname: true,
                type_vehicle: true,
                catchedPedidos: {
                    where: whereClause,
                    select: {
                        id: true,
                        created_at: true,
                        estimated_date: true,
                        delivered_date: true
                    }
                }
            }
        });

        // 2. ⭐ Calcular estatísticas de cada entregador
        const ranking = drivers
            .map(driver => {
                const entregas = driver.catchedPedidos;

                // Ignorar entregadores sem entregas no período
                if (entregas.length === 0) {
                    return null;
                }

                // Calcular tempo médio de entrega
                const tempos = entregas.map(entrega => {
                    const criacao = new Date(entrega.created_at);
                    const entregaFinal = new Date(entrega.delivered_date);
                    return (entregaFinal - criacao) / (1000 * 60); // Minutos
                });

                const tempoMedioMinutos = Math.floor(
                    tempos.reduce((sum, t) => sum + t, 0) / tempos.length
                );

                // Calcular taxa de sucesso (entregas no prazo)
                const entregasNoPrazo = entregas.filter(entrega => {
                    const estimativa = new Date(entrega.estimated_date);
                    const entregaFinal = new Date(entrega.delivered_date);
                    return entregaFinal <= estimativa;
                }).length;

                const taxaSucesso = (entregasNoPrazo / entregas.length) * 100;

                return {
                    id: driver.id,
                    name: driver.name,
                    surname: driver.surname,
                    type_vehicle: driver.type_vehicle || '-',
                    totalDeliveries: entregas.length,
                    avgTime: tempoMedioMinutos, // Tempo médio em minutos
                    successRate: parseFloat(taxaSucesso.toFixed(1)) // Taxa de sucesso
                };
            })
            .filter(driver => driver !== null) // Remover entregadores sem entregas
            .sort((a, b) => b.successRate - a.successRate); // Ordenar por taxa de sucesso

        return res.json({
            ranking
        });

    } catch (error) {
        console.error("Erro ao calcular ranking:", error);
        return res.status(500).json({ error: "Erro ao calcular performance" });
    }
}