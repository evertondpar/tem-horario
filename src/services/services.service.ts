// services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
  ) {}

  create(dto: CreateServiceDto) {
    const service = this.repo.create(dto);
    return this.repo.save(service);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.repo.save(service);
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    return this.repo.remove(service);
  }
}
