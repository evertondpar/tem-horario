// services/services.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Service } from "./entities/service.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
  ) {}

  create(dto: CreateServiceDto, establishment_id: number) {
    const service = this.repo.create(dto);
    return this.repo.save({
      ...service,
      establishment_id: establishment_id,
    });
  }

  findAll(establishment_id: string) {
    return this.repo.find({
      where: { establishment_id: Number(establishment_id) },
    });
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
