// Establishments/Establishments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Establishment } from './entities/establishment.entity';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';

@Injectable()
export class EstablishmentsService {
  constructor(
    @InjectRepository(Establishment)
    private readonly repo: Repository<Establishment>,
  ) {}

  create(dto: CreateEstablishmentDto) {
    const Establishment = this.repo.create(dto);
    return this.repo.save(Establishment);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const Establishment = await this.repo.findOne({ where: { id } });
    if (!Establishment)
      throw new NotFoundException(`Establishment ${id} not found`);
    return Establishment;
  }

  async update(id: number, dto: UpdateEstablishmentDto) {
    const Establishment = await this.findOne(id);
    Object.assign(Establishment, dto);
    return this.repo.save(Establishment);
  }

  async remove(id: number) {
    const Establishment = await this.findOne(id);
    return this.repo.remove(Establishment);
  }
}
