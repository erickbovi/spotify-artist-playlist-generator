# Imagem base
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências do sistema necessárias
RUN apk add --no-cache openssl

# Copia os arquivos de configuração
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências e gera o cliente Prisma
RUN npm install && npx prisma generate

# Copia o resto do código
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"] 