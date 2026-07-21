// collaborators/collaborators.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Collaborator } from "./entities/collaborator.entity";
import { CreateCollaboratorDto } from "./dto/create-collaborator.dto";
import { UpdateCollaboratorDto } from "./dto/update-collaborator.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly repo: Repository<Collaborator>,
  ) {}

  async create(dto: CreateCollaboratorDto, establishment_id: number) {
    const find = await this.repo.findOne({ where: { phone: dto.phone } });
    if (find?.id) {
      return {
        message: "Telefone em uso.",
        statusCode: 400,
      };
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const collaborator = this.repo.create({
      ...dto,
      establishment_id: establishment_id,
      password: hashedPassword,
    });
    return this.repo.save(collaborator);
  }

  findAll(establishment_id: number) {
    return this.repo.find({ where: { establishment_id: establishment_id } });
  }

  async findOne(id: number) {
    const collaborator = await this.repo.findOne({ where: { id } });
    if (!collaborator)
      throw new NotFoundException(`Collaborator ${id} not found`);
    return collaborator;
  }

  async update(id: number, dto: UpdateCollaboratorDto) {
    const collaborator = await this.findOne(id);
    Object.assign(collaborator, dto);
    return this.repo.save(collaborator);
  }

  async remove(id: number) {
    const collaborator = await this.findOne(id);
    return this.repo.remove(collaborator);
  }
}
