# Imagem base
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências do sistema necessárias
RUN apk add --no-cache openssl postgresql-client iputils

# Copia os arquivos de configuração
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências e gera o cliente Prisma
RUN npm install && npx prisma generate

# Copia o resto do código
COPY . .

# Expõe a porta dinâmica
ENV PORT=3000
EXPOSE $PORT

# Script de espera para o banco de dados
COPY scripts/wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Comando para iniciar a aplicação
CMD ["/wait-for-db.sh", "postgres", "--", "npm", "run", "start"] 