// auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Establishment } from "../establishments/entities/establishment.entity";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Establishment)
    private readonly establishmentRepo: Repository<Establishment>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const establishment = await this.establishmentRepo.findOne({
      where: { phone: dto.phone },
    });

    if (!establishment) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      establishment.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload = { sub: establishment.id, phone: establishment.phone };

    return {
      access_token: this.jwtService.sign(payload),
      establishment: {
        id: establishment.id,
        name: establishment.name,
        phone: establishment.phone,
      },
    };
  }
}
