// configs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FleetFlow API',
            version: '1.0.0',
            description: 'Sistema de gerenciamento de entregas e logística',
            contact: {
                name: 'FleetFlow Support',
                email: 'support@fleetflow.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desenvolvimento'
            },
            {
                url: 'https://api.fleetflow.com',
                description: 'Servidor de Produção'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtido no endpoint /api/auth/login'
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                    description: 'Cookie httpOnly com JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            example: 'João'
                        },
                        surname: {
                            type: 'string',
                            example: 'Silva'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'joao@example.com'
                        },
                        cpf: {
                            type: 'string',
                            example: '12345678900'
                        },
                        phone: {
                            type: 'string',
                            example: '11999999999'
                        },
                        role: {
                            type: 'string',
                            enum: ['ADMIN', 'OPERATOR', 'DELIVERY_MAN'],
                            example: 'DELIVERY_MAN'
                        },
                        user_status: {
                            type: 'string',
                            enum: ['ACTIVE', 'INACTIVE'],
                            example: 'ACTIVE'
                        },
                        type_vehicle: {
                            type: 'string',
                            example: 'MOTO'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        clientName: {
                            type: 'string',
                            example: 'Maria Santos'
                        },
                        clientCpf: {
                            type: 'string',
                            example: '98765432100'
                        },
                        address: {
                            type: 'string',
                            example: 'Rua das Flores, 123 - Centro, São Paulo/SP'
                        },
                        peso: {
                            type: 'number',
                            format: 'float',
                            example: 15.5
                        },
                        valor: {
                            type: 'number',
                            format: 'float',
                            example: 250.00
                        },
                        frete: {
                            type: 'number',
                            format: 'float',
                            example: 35.00
                        },
                        status: {
                            type: 'string',
                            enum: ['CREATED', 'PENDING', 'IN_DELIVERY', 'DELIVERED'],
                            example: 'PENDING'
                        },
                        estimated_date: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-03-20T18:00:00.000Z'
                        },
                        delivered_date: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: null
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-03-06T10:00:00.000Z'
                        }
                    }
                },
                Vehicle: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        crv: {
                            type: 'integer',
                            example: 123456789
                        },
                        nome: {
                            type: 'string',
                            example: 'Honda CG 160'
                        },
                        marca: {
                            type: 'string',
                            example: 'Honda'
                        },
                        tipo: {
                            type: 'string',
                            example: 'MOTO'
                        },
                        ano: {
                            type: 'integer',
                            example: 2023
                        },
                        status: {
                            type: 'string',
                            enum: ['AVAILABLE', 'UNAVAILABLE'],
                            example: 'AVAILABLE'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Mensagem de erro'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Auth',
                description: 'Endpoints de autenticação'
            },
            {
                name: 'Users',
                description: 'Gerenciamento de usuários'
            },
            {
                name: 'Orders',
                description: 'Gerenciamento de pedidos/entregas'
            },
            {
                name: 'Vehicles',
                description: 'Gerenciamento de veículos'
            },
            {
                name: 'Financial',
                description: 'Relatórios financeiros'
            },
            {
                name: 'Dashboard',
                description: 'Métricas e estatísticas'
            }
        ]
    },
    apis: ['./src/routes/*.js'] // ⭐ Caminho dos arquivos de rotas
};

export const swaggerSpec = swaggerJsdoc(options);