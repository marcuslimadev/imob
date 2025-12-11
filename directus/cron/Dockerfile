FROM node:20-alpine

WORKDIR /app

# Copiar apenas arquivos necessários
COPY cron/package.json cron/package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar scripts
COPY cron/ ./

CMD ["node", "scheduler.js"]
