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
 *       500:
 *         description: Erro ao criar o cliente
 *   get:
 *     summary: Retorna uma lista de clientes
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *       500:
 *         description: Erro ao buscar os clientes
 *   patch:
 *     summary: Atualiza informações de um cliente existente
 *     description: Atualiza dados de cliente e/ou endereço com base no ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do cliente a ser atualizado
 *                 example: 1
 *               nome:
 *                 type: string
 *                 description: Nome do cliente
 *                 example: "João Silva Atualizado"
 *               endereco:
 *                 type: object
 *                 properties:
 *                   rua:
 *                     type: string
 *                     description: Rua do endereço
 *                     example: "Rua Atualizada"
 *                   numero:
 *                     type: integer
 *                     description: Número do endereço
 *                     example: 456
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro ao atualizar o cliente
 *   delete:
 *     summary: Remove um cliente
 *     description: Exclui um cliente pelo ID, removendo também seu endereço e associações com estofados.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do cliente a ser excluído.
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro ao excluir o cliente
 */

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, endereco, estofados } = await request.json();

    const novoEndereco = await prisma.endereco.create({
      data: {
        rua: endereco.rua,
        bairro: endereco.bairro,
        numero: endereco.numero,
      },
    });

    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        enderecoId: novoEndereco.id,
      },
    });

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

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        endereco: true,
        estofados: {
          include: {
            estofado: true,
          },
        },
      },
    });

    return NextResponse.json(clientes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching clientes' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, nome, email, telefone, endereco } = await request.json();

    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome || clienteExistente.nome,
        email: email || clienteExistente.email,
        telefone: telefone || clienteExistente.telefone,
      },
    });

    if (endereco) {
      await prisma.endereco.update({
        where: { id: clienteAtualizado.enderecoId },
        data: {
          rua: endereco.rua || clienteExistente.endereco?.rua,
          bairro: endereco.bairro || clienteExistente.endereco?.bairro,
          numero: endereco.numero || clienteExistente.endereco?.numero,
        },
      });
    }

    return NextResponse.json(clienteAtualizado, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating cliente' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Obtém os parâmetros da URL
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    console.log("ID recebido na query string:", id);

    // Validação do ID
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'ID é obrigatório e deve ser um número válido' },
        { status: 400 }
      );
    }

    // Busca o cliente no banco de dados
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
      include: { endereco: true },
    });

    // Verifica se o cliente existe
    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Remove as associações com estofados
    await prisma.clienteEstofado.deleteMany({
      where: { clienteId: id },
    });

    // Remove o endereço associado, se existir
    if (clienteExistente.endereco) {
      await prisma.endereco.delete({
        where: { id: clienteExistente.enderecoId },
      });
    }

    // Remove o cliente
    await prisma.cliente.delete({
      where: { id },
    });

    console.log(`Cliente com ID ${id} foi excluído com sucesso.`);
    return NextResponse.json(
      { message: 'Cliente excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir o cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir o cliente' },
      { status: 500 }
    );
  }
}


