// auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Establishment } from "../establishments/entities/establishment.entity";
import { LoginDto } from "./dto/login.dto";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Establishment)
    private readonly establishmentRepo: Repository<Establishment>,

    @InjectRepository(Collaborator)
    private readonly collaboratorRepo: Repository<Collaborator>,
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
  async loginCollaborator(dto: LoginDto) {
    const collaborator = await this.collaboratorRepo.findOne({
      where: { phone: dto.phone },
    });

    if (!collaborator) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      collaborator.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload = {
      sub: collaborator.id,
      phone: collaborator.phone,
      establishment_id: collaborator.establishment_id,
    };
    const establishment = await this.establishmentRepo.findOne({
      where: { id: collaborator.establishment_id },
    });

    return {
      access_token: this.jwtService.sign(payload),
      collaborator: {
        id: collaborator.id,
        name: collaborator.name,
        phone: collaborator.phone,
      },
      establishment: { ...establishment, password: "" },
      //devolver serviços
    };
  }
}
