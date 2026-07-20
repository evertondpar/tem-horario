// collaborators/collaborators.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly repo: Repository<Collaborator>,
  ) {}

  create(dto: CreateCollaboratorDto) {
    const collaborator = this.repo.create(dto);
    return this.repo.save(collaborator);
  }

  findAll() {
    return this.repo.find();
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
