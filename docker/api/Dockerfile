FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

EXPOSE 4000

# Wait for DB and seed before starting
CMD sh -c "sleep 5 && node --loader ts-node/esm src/seed.ts || true && node --loader ts-node/esm src/index.ts"
