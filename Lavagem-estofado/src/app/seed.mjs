import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criação de endereços
  const endereco1 = await prisma.endereco.create({
    data: {
      rua: 'Rua das Flores',
      bairro: 'Jardim das Rosas',
      numero: 123,
    },
  });

  const endereco2 = await prisma.endereco.create({
    data: {
      rua: 'Avenida Central',
      bairro: 'Centro',
      numero: 456,
    },
  });

  // Criação de clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'João Silva',
      email: 'joao.silva@example.com',
      telefone: '123456789',
      enderecoId: endereco1.id,
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      telefone: '987654321',
      enderecoId: endereco2.id,
    },
  });

  // Criação de estofados
  const estofado1 = await prisma.estofado.create({
    data: {
      tipo: 'Sofá 3 lugares',
    },
  });

  const estofado2 = await prisma.estofado.create({
    data: {
      tipo: 'Poltrona reclinável',
    },
  });

  // Associação de clientes com estofados
  await prisma.clienteEstofado.createMany({
    data: [
      { clienteId: cliente1.id, estofadoId: estofado1.id },
      { clienteId: cliente2.id, estofadoId: estofado2.id },
    ],
  });

  // Criação de pagamentos
  const pagamento1 = await prisma.pagamento.create({
    data: {
      valor: 1000.0,
      dataPagamento: new Date('2024-01-15'),
      clienteId: cliente1.id,
    },
  });

  const pagamento2 = await prisma.pagamento.create({
    data: {
      valor: 2000.0,
      dataPagamento: new Date('2024-02-20'),
      clienteId: cliente2.id,
    },
  });

  // Criação de notas fiscais
  const notaFiscal1 = await prisma.notaFiscal.create({
    data: {
      clienteId: cliente1.id,
      pagamentoId: pagamento1.id,
    },
  });

  const notaFiscal2 = await prisma.notaFiscal.create({
    data: {
      clienteId: cliente2.id,
      pagamentoId: pagamento2.id,
    },
  });

  // Associação de estofados com notas fiscais
  await prisma.notaFiscalEstofado.createMany({
    data: [
      { notaFiscalId: notaFiscal1.id, estofadoId: estofado1.id },
      { notaFiscalId: notaFiscal2.id, estofadoId: estofado2.id },
    ],
  });

  console.log('Dados inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });