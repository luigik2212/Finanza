# Finanza - Frontend SaaS de Finanças Pessoais

Frontend completo para um SaaS de finanças pessoais (pessoa física), criado com React + Vite + TypeScript e TailwindCSS.

## Stack
- React + Vite + TypeScript
- TailwindCSS
- shadcn/ui (componentes utilitários)
- react-router-dom
- @tanstack/react-query
- axios
- react-hook-form + zod + @hookform/resolvers
- lucide-react
- recharts

## Como rodar

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` com a URL da API:

```bash
cp .env.example .env
```

3. Rode o projeto:

```bash
npm run dev
```

## Build para produção

```bash
npm run build
```

O build gera a pasta `dist/`, pronta para hospedar na VPS.

## Estrutura de pastas

```
src/
  app/          # providers, router, layout, query client
  components/   # UI e componentes do dashboard
  features/     # fluxos de domínio (transactions, categories, merchants)
  lib/          # formatters e utils
  pages/        # páginas principais
  services/     # apiClient e endpoints
```

## Variáveis de ambiente

- `VITE_API_URL`: base URL da API.

## Observações
- O frontend assume que a API retorna apenas dados do usuário autenticado.
- Token é armazenado em `localStorage` como `access_token`.
