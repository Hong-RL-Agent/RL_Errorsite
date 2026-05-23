# Java 17 경량화 버전 사용
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 jar 파일을 컨테이너 내부로 복사
# (만약 Maven이 아니라 Gradle을 쓰신다면 COPY build/libs/*.jar app.jar 로 수정해주세요!)
COPY target/*.jar app.jar

# 9044번 때와 동일하게 백엔드 내부 포트는 8080으로 고정
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]