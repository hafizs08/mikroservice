FROM openjdk:17
WORKDIR /app
COPY target/eureka-server.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
