# 1. 빌드 스테이지 (Vite로 코드를 압축하고 빌드합니다)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 스테이지 (Vite 개발 서버 대신 Nginx를 씁니다!)
FROM nginx:alpine
# 빌드된 결과물을 Nginx 폴더로 복사
COPY --from=builder /app/dist /usr/share/nginx/html
# 프론트엔드 전용 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 프론트엔드 컨테이너는 80번 포트를 엽니다. 
# (어차피 사용자는 최상단의 9043번으로 들어오니 걱정 마세요!)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]