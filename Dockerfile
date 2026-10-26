FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN mkdir -p /data && chown node:node /data
ENV NODE_ENV=production
EXPOSE 8787
USER node
CMD ["npx", "tsx", "src/server/main.ts"]
