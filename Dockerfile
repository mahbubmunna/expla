FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Verify strict dependency installation
RUN npm ci

COPY . .

# verify typescript
RUN npx tsc --noEmit

CMD ["echo", "Build verification successful"]
