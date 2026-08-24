// collaborator-service/collaborator-service.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CollaboratorService } from "./entities/collaborator-service.entity";
import { CreateCollaboratorServiceDto } from "./dto/create-collaborator-service.dto";
import { UpdateCollaboratorServiceDto } from "./dto/update-collaborator-service.dto";
import { Service } from "src/services/entities/service.entity";

@Injectable()
export class CollaboratorServiceService {
  constructor(
    @InjectRepository(CollaboratorService)
    private readonly repo: Repository<CollaboratorService>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(
    dto: CreateCollaboratorServiceDto,
    collaborator_id: number,
    establishmentId: number,
  ) {
    const service = await this.serviceRepo.findOne({
      where: { id: dto.service_id },
    });
    if (!service) throw new NotFoundException("Serviço não encontrado.");
    if (service.establishment_id !== establishmentId) {
      throw new ForbiddenException("Serviço fora do seu estabelecimento.");
    }
    const existing = await this.repo.findOne({
      where: { collaborator_id, service_id: dto.service_id },
    });
    if (existing) throw new ConflictException("Serviço já atribuído.");
    const item = this.repo.create({
      ...dto,
      collaborator_id: collaborator_id,
    });
    return this.repo.save(item);
  }

  findAll(collaborator_id: number) {
    return this.repo.find({
      where: { collaborator_id: collaborator_id },
      relations: { service: true },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item)
      throw new NotFoundException(`CollaboratorService ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateCollaboratorServiceDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async updateOwned(
    id: number,
    dto: UpdateCollaboratorServiceDto,
    collaboratorId: number,
    establishmentId: number,
  ) {
    const item = await this.repo.findOne({
      where: { id, collaborator_id: collaboratorId },
    });
    if (!item) throw new NotFoundException("Serviço atribuído não encontrado.");
    if (dto.service_id) {
      const service = await this.serviceRepo.findOne({
        where: { id: dto.service_id },
      });
      if (!service || service.establishment_id !== establishmentId) {
        throw new ForbiddenException("Serviço fora do seu estabelecimento.");
      }
    }
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repo.remove(item);
  }

  async removeOwned(id: number, collaboratorId: number) {
    const item = await this.repo.findOne({
      where: { id, collaborator_id: collaboratorId },
    });
    if (!item) throw new NotFoundException("Serviço atribuído não encontrado.");
    return this.repo.remove(item);
  }
}
