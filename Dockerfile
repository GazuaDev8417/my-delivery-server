# 1. Usa uma imagem oficial do Node.js
FROM node:18-alpine

# 2. Define a pasta de trabalho dentro do contêiner
WORKDIR /usr/src/app

# 3. Copia primeiro os arquivos de dependências (package.json e package-lock.json/yarn.lock)
COPY package*.json ./

# 4. Instala as dependências da API dentro do contêiner
RUN npm install

# 5. Copia todo o restante do código da sua API para dentro do contêiner
COPY . .

# 6. Expõe a porta que a API usa (ex: 3000)
EXPOSE 3003

# 7. Comando para iniciar a aplicação (ajuste 'start' ou 'dev' conforme o seu package.json se necessário)
CMD ["npm", "start"]