# Etapa de dependências
FROM node:18-slim AS dependencies
WORKDIR /app

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./
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
COPY --from=dependencies /app/node_modules ./node_modules

# Gerar o cliente Prisma e fazer o build
RUN npx prisma generate && npm run build

# Etapa de produção
FROM node:18-slim AS production
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos necessários
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Dar permissões corretas aos arquivos
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/node_modules/.prisma

# Verificar se os arquivos foram copiados corretamente
RUN ls -la

# Definir usuário não-root
USER nextjs

# Expor a porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Comando de inicialização que executa o prisma db push e inicia a aplicação
CMD sh -c "npx prisma generate && npx prisma db push --accept-data-loss && npm start"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1 