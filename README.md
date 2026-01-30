# Finanza - Fullstack (Client + Server)

Projeto fullstack em um único repositório com frontend (React + Vite) e backend (Fastify + Prisma + Postgres).

## Estrutura

```
client/  # SPA React + Vite
server/  # API REST + Prisma + Postgres
```

## Requisitos

- Node.js 20+
- Docker (para subir o Postgres)

## Configuração inicial

1. Suba o Postgres via Docker:

```bash
docker compose up -d
```

2. Configure o backend:

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
```

3. Configure o frontend (opcional):

```bash
cd ../client
cp .env.example .env
npm install
```

## Desenvolvimento

Na raiz do repositório:

```bash
npm install
npm run dev
```

Isso inicia `client` e `server` simultaneamente. A SPA chama a API em `/api`.

## Produção

```bash
npm run build
npm run start
```

O backend serve o build do frontend (`client/dist`) e faz fallback SPA (todas as rotas não-API retornam `index.html`).

## Variáveis de ambiente

Backend (`server/.env`):

- `DATABASE_URL`: conexão Postgres
- `JWT_SECRET`: segredo do JWT
- `PORT`: porta do servidor (default 3000)

Frontend (`client/.env`):

- `VITE_API_URL=/api`

## Scripts úteis

Na raiz:

- `npm run dev` - client + server em modo dev
- `npm run build` - builda client e server
- `npm run start` - inicia o server (com client buildado)

No backend (`server`):

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run migrate`
- `npm run seed`
