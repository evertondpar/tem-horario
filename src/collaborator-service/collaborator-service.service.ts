// collaborator-service/collaborator-service.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaboratorService } from './entities/collaborator-service.entity';
import { CreateCollaboratorServiceDto } from './dto/create-collaborator-service.dto';
import { UpdateCollaboratorServiceDto } from './dto/update-collaborator-service.dto';

@Injectable()
export class CollaboratorServiceService {
  constructor(
    @InjectRepository(CollaboratorService)
    private readonly repo: Repository<CollaboratorService>,
  ) {}

  create(dto: CreateCollaboratorServiceDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find();
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

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repo.remove(item);
  }
}
