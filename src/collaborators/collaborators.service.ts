// collaborators/collaborators.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Collaborator } from "./entities/collaborator.entity";
import { CreateCollaboratorDto } from "./dto/create-collaborator.dto";
import { UpdateCollaboratorDto } from "./dto/update-collaborator.dto";
import * as bcrypt from "bcrypt";
import { SchedulesService } from "src/schedules/schedules.service";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly repo: Repository<Collaborator>,
    private readonly scheduleService: SchedulesService,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(CollaboratorService)
    private readonly collaboratorServiceRepo: Repository<CollaboratorService>,
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
    const created = await this.repo.save(collaborator);
    console.log("collaborator ", collaborator);
    if (created?.id) {
      await this.scheduleService.create(created?.id);
    }
    return created;
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
    await this.collaboratorServiceRepo.delete({
      collaborator_id: id,
    });
    await this.scheduleRepo.delete({ collaborator_id: id });
    return this.repo.remove(collaborator);
  }
}
