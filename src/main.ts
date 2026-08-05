/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  if (config.get("DEV")) {
    app.enableCors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
    });
    app.use((req, res, next) => {
      console.log(`${req?.method} ${req?.originalUrl}`);
      next();
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(config.get<number>("PORT") ?? 3000);
}
bootstrap();
