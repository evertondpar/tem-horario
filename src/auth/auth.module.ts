// auth/auth.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Establishment } from "../establishments/entities/establishment.entity";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { CollaboratorJwtStrategy } from "./strategies/collaborator-jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([Establishment, Collaborator]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CollaboratorJwtStrategy],
  exports: [JwtStrategy, CollaboratorJwtStrategy],
})
export class AuthModule {}
