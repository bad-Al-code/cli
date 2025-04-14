FROM node:alpine3.21 AS builder
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci 
COPY . . 

RUN npm run build

FROM node:alpine3.21 AS runner 
WORKDIR /usr/src/app 
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser 
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /usr/src/app/package.json ./
# RUN npm ci --omit=dev
ENTRYPOINT ["node", "dist/main.js"]
