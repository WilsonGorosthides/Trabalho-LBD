# Trabalho-LBD
## Roteiro Completo para Rodar a aplicação de Gerencia da Empresa de Lvagem de Estofado

### 🚀 Objetivo do Projeto
- Criar e configurar um modelo Prisma.
- Gerar migrações para o banco de dados.
- Testar as operações CRUD (criação, leitura, atualização e exclusão) via API.
- Forneça operações de CRUD completas via API e um frontend funcional.
- Implemente gatilhos no banco para alterações de registrador.


### Estrutura do Projeto

- **Next.js**: Framework para React.
- **Prisma**: ORM para acesso ao banco de dados.
- **PostgreSQL**: Banco de dados relacional.

#### Passo 1: Clonar o Repositório
Inicie clonando o repositório do projeto que será a base para a aula.
```bash
git clone https://github.com/vanborges/prisma-database.git
```
```bash
cd lavagem-estofado
```
```bash
npm install
```

#### Passo 2: Inicializar o Prisma Database:
O comando npx prisma init é utilizado para configurar o Prisma em um projeto Node.js pela primeira vez. Ele cria os arquivos de configuração básicos necessários para o Prisma funcionar no projeto. 
```bash
npx prisma init
```

Quando você executa npx prisma init, o Prisma cria dois arquivos principais na pasta do seu projeto:

1. Prisma Schema File (schema.prisma): Este arquivo é criado no diretório prisma/ e contém a configuração principal para o Prisma. Nele, você define:
- Datasource: O tipo de banco de dados que você está usando (como PostgreSQL, MySQL, SQLite, etc.) e as credenciais de conexão.
- Generator: Especifica qual linguagem ou framework você usará para gerar o cliente do Prisma. Por exemplo, você pode configurar o Prisma Client para gerar o código TypeScript para acessar seu banco de dados.

2. Arquivo .env: Este arquivo contém variáveis de ambiente, como DATABASE_URL, que o Prisma usa para se conectar ao banco de dados. Esse arquivo .env será criado na raiz do projeto e permite que você configure as informações de conexão de forma segura.

#### 2.1.	Configurar o Banco de Dados:
Abra o arquivo .env e defina a URL do banco de dados.
Exemplo:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
```

#### Passo 3: Criar os Modelos:
No arquivo prisma/schema.prisma, revise e crie novos modelos se necessário. 
```bash
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Estofado {
  id          Int               @id @default(autoincrement())
  tipo        String
  notasFiscais NotaFiscalEstofado[]
  clientes    ClienteEstofado[]
}

model Cliente {
  id          Int               @id @default(autoincrement())
  nome        String
  email       String            @unique
  telefone    String?
  endereco    Endereco          @relation(fields: [enderecoId], references: [id], onDelete: Cascade)
  enderecoId  Int               @unique
  pagamentos  Pagamento[]
  notasFiscais NotaFiscal[]
  estofados   ClienteEstofado[]
}

model Pagamento {
  id            Int          @id @default(autoincrement())
  valor         Float        @default(0)
  dataPagamento DateTime
  cliente       Cliente      @relation(fields: [clienteId], references: [id])
  clienteId     Int
  notaFiscal    NotaFiscal?  // Detalhes do relacionamento definidos no lado NotaFiscal
}

model NotaFiscal {
  id          Int                 @id @default(autoincrement())
  cliente     Cliente             @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  clienteId   Int
  pagamento   Pagamento           @relation(fields: [pagamentoId], references: [id], onDelete: Cascade)
  pagamentoId Int                 @unique
  estofados   NotaFiscalEstofado[]
}

model Endereco {
  id        Int      @id @default(autoincrement())
  rua       String
  bairro    String?
  numero    Int
  cliente   Cliente?  @relation
}

model ClienteEstofado {
  clienteId  Int
  estofadoId Int
  cliente    Cliente   @relation(fields: [clienteId], references: [id])
  estofado   Estofado  @relation(fields: [estofadoId], references: [id])

  @@id([clienteId, estofadoId])
}

model NotaFiscalEstofado {
  notaFiscalId Int
  estofadoId   Int
  notaFiscal   NotaFiscal @relation(fields: [notaFiscalId], references: [id])
  estofado     Estofado   @relation(fields: [estofadoId], references: [id])

  @@id([notaFiscalId, estofadoId])
}
```
#### Passo 4: Gerar migration com base no modelo
Com o esquema do Prisma configurado execute o seguinte comando:
```bash
npx prisma migrate dev --name init
```
Esse comando realiza as seguintes ações:
```
	1.	Compara o estado atual do banco de dados com o esquema definido no Prisma.
	2.	Gera uma migration e a aplica para sincronizar o banco de dados com o esquema Prisma.
	3.	Nomeia a migration gerada como ‘init’, o que é útil para identificar o propósito ou estágio das mudanças.
	4.	Atualiza o cliente Prisma, garantindo que seu código possa interagir corretamente com o banco de dados após as alterações.
```
#### Passo 5: Popular o Banco de Dados com o Script de Seed
Para popular o banco de dados com dados iniciais, você pode utilizar o script de seed já configurado. O arquivo de seed está localizado em src/app/seed.mts e contém instruções para inserir dados no banco de dados.

Execute o seguinte comando no terminal para rodar o script de seed e popular o banco de dados:
```bash
npm run seed
```
O comando npm run seed executará o arquivo seed.mts e inserirá os dados iniciais no banco de dados conforme definido no script.

#### Passo 6: Iniciar o Servidor
Agora que o banco de dados está configurado e as migrações foram aplicadas, você pode iniciar o servidor de desenvolvimento do Next.js para testar a API.

##### 6.1.	Inicie o servidor Next.js:
No terminal, execute o seguinte comando para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
##### 6.2.	Verifique o servidor:
Uma vez iniciado, o servidor estará rodando no endereço http://localhost:3000.

#### Passo 7: Testar a API
A API está configurada no diretório src/app/api. Neste ponto, a aplicação contém uma pasta funcionarios, onde você encontrará as rotas:

- POST: Para criar novos funcionários.
- GET: Para listar os funcionários existentes.

Você pode testar a API de duas formas:

- Usando a interface do Swagger UI gerada em http://localhost:3000/api/swagger, onde você pode visualizar e testar todos os endpoints da API de maneira interativa.
- Usando ferramentas tradicionais como Postman, Insomnia, ou cURL.

##### 7.1. Testar a API via Swagger UI

Para testar a API usando a documentação interativa gerada pelo Swagger UI, siga os passos abaixo:

- Acesse a interface do Swagger UI no navegador:
```bash
http://localhost:3000/api/swagger
```

- Dentro da interface Swagger, você verá a lista de rotas disponíveis, incluindo:
POST /api/funcionarios para criar um novo funcionário.
GET /api/funcionarios para listar os funcionários existentes.

- Clique no endpoint desejado e preencha os parâmetros solicitados na interface. Em seguida, clique em Execute para realizar a requisição diretamente pelo Swagger UI.

##### 7.2. Testar API de outras formas

Além do Swagger UI, você pode testar a API usando Postman, Insomnia, ou cURL para enviar uma requisição POST e criar um novo funcionário. Exemplo de requisição cURL:

Testar rota via cURL - POST /api/funcionarios:
```bash
curl -X POST http://localhost:3000/api/funcionarios \
-H "Content-Type: application/json" \
-d '{
  "nome": "Mickey Mouse",
  "salario": "5000",
  "endereco": {
    "rua": "Rua da Diversão",
    "bairro": "Disneyland",
    "numero": 123
  },
  "dependentes": [
    {
      "nome": "Minnie Mouse",
      "parentesco": "Namorada"
    }
  ],
  "projetos": [1, 2]
}'
```
- Testar a Rota GET (Listar Funcionários)
```bash
curl -X GET http://localhost:3000/api/funcionarios
```
