FROM node:18-alpine AS base

# Instala dependências necessárias
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Camada de dependências
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# Camada de build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configura as variáveis de ambiente para o build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Gera o build da aplicação
RUN npm run build

# Camada de produção
FROM base AS runner
WORKDIR /app

# Configura as variáveis de ambiente
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Adiciona um usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Copia os arquivos necessários
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts/wait-for-db.sh ./scripts/wait-for-db.sh

# Configura as permissões
RUN chmod +x ./scripts/wait-for-db.sh

# Configuração especial para o Prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Muda para o usuário não-root
USER nextjs

# Expõe a porta
EXPOSE 3000

# Configura o host para IPv6
ENV HOSTNAME "::"

# Define o healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Define o comando de inicialização
CMD ["./scripts/wait-for-db.sh", "node", "server.js"] 