# Brinca e Sente

Loja de produtos sensoriais 3D, feita em React + Vite, com uma API própria (login, conta, pedidos) rodando como funções serverless na Vercel.

## Rodando localmente

```bash
npm install
npm run dev:all   # sobe o front (Vite) e a API (Express) juntos
```

O front fica em `http://localhost:5173`, a API em `http://localhost:4000` (o Vite faz proxy de `/api/*` para lá).

## Banco de dados (Turso)

A API guarda usuários e pedidos num banco Turso (SQLite hospedado). Sem essa configuração, cadastro/login/pedidos não funcionam.

1. Crie uma conta grátis em [turso.tech](https://turso.tech).
2. Instale a CLI e faça login:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```
3. Crie o banco:
   ```bash
   turso db create brinca-e-sente
   turso db show brinca-e-sente --url
   turso db tokens create brinca-e-sente
   ```
4. Copie `.env.example` para `.env` e preencha `TURSO_DATABASE_URL` (saída do `db show`) e `TURSO_AUTH_TOKEN` (saída do `tokens create`).
5. Em produção (Vercel): Project Settings → Environment Variables → adicione as mesmas duas variáveis (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`) e um `JWT_SECRET` próprio.

As tabelas (`users`, `orders`) são criadas automaticamente na primeira requisição — não precisa rodar migração manual.

## Pagamento via Pix

O checkout gera um QR Code de Pix estático (chave, nome e cidade fixos em `src/utils/pix.js`). Como é um Pix estático, o pagamento **não é confirmado automaticamente** — o pedido entra com status "Pendente" e alguém do time precisa confirmar manualmente que o Pix caiu.

## Deploy

O projeto está publicado na Vercel a partir deste repositório. `vercel.json` faz o rewrite de rotas para o React Router funcionar como SPA; as pastas `api/` viram funções serverless automaticamente.
