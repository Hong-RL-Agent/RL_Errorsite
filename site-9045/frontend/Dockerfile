# alpine 대신 호환성이 완벽한 slim 사용
FROM node:20-slim
WORKDIR /app

# 패키지 파일만 먼저 복사
COPY package*.json ./

# 리눅스 환경에 맞는 모듈로 새로 설치
RUN npm install

# 나머지 소스 코드 복사 (이때 .dockerignore 덕분에 윈도우의 node_modules는 무시됨)
COPY . .

EXPOSE 9045
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "9045"]