FROM openjdk:17-jdk
WORKDIR /app
COPY ./target/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8181
CMD ["java", "-jar", "app.jar"]