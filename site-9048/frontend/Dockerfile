FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /workspace/dist ./dist
EXPOSE 9048
CMD ["serve", "-s", "dist", "-l", "9048"]
