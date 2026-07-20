// schedules/schedules.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly repo: Repository<Schedule>,
  ) {}

  create(dto: CreateScheduleDto) {
    const schedule = this.repo.create(dto);
    return this.repo.save(schedule);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const schedule = await this.repo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule ${id} not found`);
    return schedule;
  }

  async update(id: number, dto: UpdateScheduleDto) {
    const schedule = await this.findOne(id);
    Object.assign(schedule, dto);
    return this.repo.save(schedule);
  }

  async remove(id: number) {
    const schedule = await this.findOne(id);
    return this.repo.remove(schedule);
  }
}
