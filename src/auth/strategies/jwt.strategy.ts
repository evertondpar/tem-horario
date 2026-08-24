import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET") || "secret",
    });
  }

  validate(payload: {
    sub: number;
    phone: string;
    role?: "establishment" | "collaborator" | "client";
    establishment_id?: number;
  }) {
    // O que der return aqui vira `request.user` nas rotas protegidas
    const role =
      payload.role ??
      (payload.establishment_id ? "collaborator" : "establishment");
    return {
      id: payload.sub,
      phone: payload.phone,
      role,
      establishment_id:
        role === "collaborator"
          ? payload.establishment_id
          : role === "establishment"
            ? payload.sub
            : null,
    };
  }
}
