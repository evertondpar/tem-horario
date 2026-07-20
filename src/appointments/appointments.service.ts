// appointments/appointments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  create(dto: CreateAppointmentDto) {
    const appointment = this.repo.create(dto);
    return this.repo.save(appointment);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const appointment = await this.repo.findOne({ where: { id } });
    if (!appointment)
      throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    Object.assign(appointment, dto);
    return this.repo.save(appointment);
  }

  async remove(id: number) {
    const appointment = await this.findOne(id);
    return this.repo.remove(appointment);
  }
}
