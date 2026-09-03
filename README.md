# Oficina Fácil

Sistema web simples para pequenas oficinas: clientes, veículos, ordens de serviço, estoque, pagamentos, recibos, financeiro e relatórios. A interface e as mensagens são inteiramente em português do Brasil.

## Tecnologias

Next.js (App Router), React, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Zod, JWT (`jose`) e `bcryptjs`. O backend usa Route Handlers e Server Actions do próprio Next.js.

## Requisitos

- Node.js 22+
- PostgreSQL 16+ (ou Docker)
- npm

## Instalação local

```bash
cp .env.example .env
npm install
npm run db:migrate -- --name inicial
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`. Em **desenvolvimento**, o seed cria `admin@oficina.local` / `admin123`. Essa conta não é criada em produção; use uma senha forte e altere `AUTH_SECRET` antes de publicar.

### Variáveis de ambiente

- `DATABASE_URL`: conexão PostgreSQL no formato usado pelo Prisma.
- `AUTH_SECRET`: chave aleatória de, no mínimo, 32 caracteres.
- `NODE_ENV`: `development` ou `production`.

## Banco, migrations e seed

```bash
npm run db:migrate             # cria/aplica migration em desenvolvimento
npx prisma migrate deploy      # aplica migrations em produção
npm run db:seed                # dados demonstrativos
npx prisma studio              # inspeção opcional
```

O seed inclui 5 clientes, 5 veículos, 10 serviços, 15 produtos, 5 ordens, pagamentos e lançamentos. Senhas são armazenadas somente como hash bcrypt.

## Produção

```bash
npm run build
npm start
```

Configure `DATABASE_URL` e um `AUTH_SECRET` exclusivo. Execute `npx prisma migrate deploy` antes de iniciar. Use HTTPS para que o cookie de sessão seja marcado como seguro.

## Docker

```bash
cp .env.example .env
# ajuste AUTH_SECRET no docker-compose.yml para produção
docker compose up -d db
npm install && npm run db:migrate -- --name inicial && npm run db:seed
docker compose up --build app
```

O PostgreSQL persiste no volume `postgres_data`. A aplicação responde na porta 3000.

## Regras importantes

- O estoque é baixado de forma transacional ao finalizar uma OS e estornado ao cancelá-la.
- Cada pagamento gera exatamente um lançamento financeiro vinculado e atualiza o estado pendente/parcial/pago.
- Funcionários não acessam configurações nem exclusões administrativas.
- Ordens e recibos têm páginas próprias de impressão e podem ser salvos em PDF pelo navegador.
