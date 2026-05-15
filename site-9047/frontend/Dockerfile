FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/dist /built-dist
CMD ["sh", "-c", "cp -r /built-dist/. /app/dist/ && while true; do sleep 3600; done"]
