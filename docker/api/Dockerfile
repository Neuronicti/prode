FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

EXPOSE 4000

CMD ["node", "--loader", "ts-node/esm", "src/index.ts"]
