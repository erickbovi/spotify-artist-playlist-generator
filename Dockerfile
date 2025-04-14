FROM node:18-alpine AS dependencies

# Instalação do OpenSSL e outras dependências necessárias
RUN apk add --no-cache openssl

# Configuração de variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies)
RUN npm install

# Build stage
FROM node:18-alpine AS builder

# Instalação do OpenSSL para o estágio de build
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Garante que o Tailwind e outras dependências de build estejam disponíveis
RUN npm install tailwindcss postcss autoprefixer

RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npm", "start"] 