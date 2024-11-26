import { NextResponse } from 'next/server';
import prisma from '../../lib/PrismaClient';

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     description: Adiciona um novo cliente ao banco de dados, incluindo seu endereço, estofados, pagamentos e notas fiscais.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do cliente
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 description: E-mail do cliente
 *                 example: "joao.silva@example.com"
 *               telefone:
 *                 type: string
 *                 description: Telefone do cliente
 *                 example: "123456789"
 *               endereco:
 *                 type: object
 *                 properties:
 *                   rua:
 *                     type: string
 *                     description: Rua do endereço
 *                     example: "Rua das Flores"
 *                   bairro:
 *                     type: string
 *                     description: Bairro do endereço
 *                     example: "Jardim das Rosas"
 *                   numero:
 *                     type: integer
 *                     description: Número do endereço
 *                     example: 123
 *               estofados:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   description: ID do estofado
 *                   example: 1
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID do cliente
 *                   example: 1
 *                 nome:
 *                   type: string
 *                   description: Nome do cliente
 *                   example: "João Silva"
 *                 email:
 *                   type: string
 *                   description: E-mail do cliente
 *                   example: "joao.silva@example.com"
 *                 endereco:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID do endereço
 *                       example: 1
 *                     rua:
 *                       type: string
 *                       description: Rua do endereço
 *                       example: "Rua das Flores"
 *                     bairro:
 *                       type: string
 *                       description: Bairro do endereço
 *                       example: "Jardim das Rosas"
 *                     numero:
 *                       type: integer
 *                       description: Número do endereço
 *                       example: 123
 *     500:
 *       description: Erro ao criar o cliente
 */
export async function POST(request: Request) {
  try {
    const { nome, email, telefone, endereco, estofados } = await request.json();

    // Criação do endereço do cliente
    const novoEndereco = await prisma.endereco.create({
      data: {
        rua: endereco.rua,
        bairro: endereco.bairro,
        numero: endereco.numero,
      },
    });

    // Criação do cliente
    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        enderecoId: novoEndereco.id, // Associa o cliente ao endereço
      },
    });

    // Associação de estofados ao cliente
    if (estofados && estofados.length > 0) {
      await prisma.clienteEstofado.createMany({
        data: estofados.map((estofadoId: number) => ({
          clienteId: novoCliente.id,
          estofadoId,
        })),
      });
    }

    return NextResponse.json(novoCliente, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating cliente' }, { status: 500 });
  }
}
