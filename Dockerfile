# Etapa de dependências
FROM node:18-slim AS deps
WORKDIR /app

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm install

# Etapa de build
FROM node:18-slim AS builder
WORKDIR /app

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório public se não existir
RUN mkdir -p public

# Copiar arquivos do projeto
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Gerar o cliente Prisma e fazer o build
RUN npx prisma generate && npm run build

# Etapa de produção
FROM node:18-slim AS runner
WORKDIR /app

# Criar usuário não-root
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Criar diretórios necessários
RUN mkdir -p .next/static public

# Copiar arquivos necessários
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/public ./public/

# Definir usuário não-root
USER nextjs

# Expor a porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV PORT 3000
ENV NODE_ENV production

# Comando de inicialização
CMD ["node", "server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1 