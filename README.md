# Sistema Oficina

Sistema web simples para controle interno de uma oficina mecânica: clientes, veículos, ordens de serviço, estoque, serviços e financeiro. Uso exclusivamente interno pela equipe da oficina.

## Tecnologias

- Next.js 16 (App Router) + React + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM

## Rodando localmente

1. Tenha um PostgreSQL acessível e configure a variável `DATABASE_URL` no arquivo `.env` (veja `.env.example`).
2. Instale as dependências:

```bash
npm install
```

3. Aplique as migrações do banco:

```bash
npx prisma migrate deploy
```

4. (Opcional) Popule dados de teste:

```bash
npm run seed
```

5. Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy no Coolify

O projeto já inclui um `Dockerfile` pronto para produção (build multi-stage com `next build` em modo standalone + Prisma).

1. **Banco de dados**: no Coolify, crie um recurso de banco **PostgreSQL** (em *Resources → Databases*). Anote a *connection string* interna gerada.
2. **Aplicação**: crie um novo recurso do tipo *Application*, apontando para este repositório Git, com build pack **Dockerfile**.
3. **Variáveis de ambiente**: na aplicação, defina:
   - `DATABASE_URL` = a connection string do banco Postgres criado no passo 1 (formato `postgresql://usuario:senha@host:5432/banco?schema=public`).
4. **Porta**: a aplicação expõe a porta `3000` (já configurado no Dockerfile).
5. Faça o deploy. No start do container, o `Dockerfile` roda `prisma migrate deploy` automaticamente antes de iniciar o servidor — as tabelas do banco são criadas/atualizadas sozinhas, sem passos manuais.
6. (Opcional) Para popular dados de teste em produção, rode uma vez via terminal do Coolify (aba *Terminal* do recurso da aplicação):

```bash
npm run seed
```

### Domínio e HTTPS

Configure o domínio da oficina e ative o certificado (Let's Encrypt automático) diretamente na aba *Domains* do recurso da aplicação no Coolify.
