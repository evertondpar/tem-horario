// Establishments/Establishments.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Establishment } from "./entities/establishment.entity";
import { CreateEstablishmentDto } from "./dto/create-establishment.dto";
import { UpdateEstablishmentDto } from "./dto/update-establishment.dto";
import * as bcrypt from "bcrypt";
import { Service } from "src/services/entities/service.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import {
  Appointment,
  AppointmentStatus,
} from "src/appointments/entities/appointment.entity";
import { DashboardResponse } from "./types";

@Injectable()
export class EstablishmentsService {
  constructor(
    @InjectRepository(Establishment)
    private readonly repo: Repository<Establishment>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepo: Repository<Collaborator>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async create(dto: CreateEstablishmentDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const establishment = this.repo.create({
      ...dto,
      password: hashedPassword,
    });
    return this.repo.save(establishment);
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
  async getDashboardInfos(id: number): Promise<DashboardResponse> {
    const establishment = await this.repo.exists({
      where: { id },
    });

    if (!establishment) {
      throw new NotFoundException("Estabelecimento não encontrado.");
    }
    const [collaborators, services, nextAppointments] = await Promise.all([
      this.collaboratorRepo.find({
        where: { establishment_id: id },
      }),
      this.serviceRepo.find({
        where: { establishment_id: id },
      }),
      this.appointmentRepo.find({
        where: {
          establishment_id: id,
          status: In([
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
          ]),
        },
        order: {
          appointment_date: "ASC",
          start_time: "ASC",
        },
        take: 5,
      }),
    ]);
    return {
      services,
      collaborators,
      appointments: nextAppointments,
    };
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
