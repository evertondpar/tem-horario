/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// appointments/appointments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Appointment, AppointmentStatus } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { Service } from "src/services/entities/service.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import dayjs from "dayjs";
import {
  DaySchedule,
  ScheduleStatus,
  TimeSlot,
} from "src/helpers/generateSchedule";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(Collaborator)
    private readonly collaboratorRepo: Repository<Collaborator>,

    @InjectRepository(CollaboratorService)
    private readonly collaboratorServiceRepo: Repository<CollaboratorService>,
    private readonly dataSource: DataSource,
  ) {}

  private getDaySchedule(schedule: Schedule, appointmentDate: string): any {
    const days: any[] = [
      schedule.sunday,
      schedule.monday,
      schedule.tuesday,
      schedule.wednesday,
      schedule.thursday,
      schedule.friday,
      schedule.saturday,
    ];

    const day = days[dayjs(appointmentDate).day()];

    if (!day) {
      throw new BadRequestException("Dia da agenda inválido.");
    }

    if (day.day !== appointmentDate) {
      throw new BadRequestException(
        "A agenda não corresponde ao dia informado.",
      );
    }

    return day;
  }

  private updateScheduleSlots(
    schedule: Schedule,
    appointment: Appointment,
    service: Service,
    status: ScheduleStatus,
  ) {
    const day = this.getDaySchedule(schedule, appointment.appointment_date);

    const startSlot = TimeSlot[appointment.start_time.replace(":", "")];

    const duration = service.duration_minutes / 30;

    for (let i = 0; i < duration; i++) {
      day.slots[startSlot + i] = status;
    }
  }

  validateSchedule(
    schedule: Schedule,
    dto: CreateAppointmentDto,
    service: Service,
  ): {
    day: DaySchedule;
    startSlot: number;
    duration: number;
  } {
    const days: any[] = [
      schedule.sunday,
      schedule.monday,
      schedule.tuesday,
      schedule.wednesday,
      schedule.thursday,
      schedule.friday,
      schedule.saturday,
    ];

    const day: DaySchedule = days[dayjs(dto.appointment_date).day()];
    if (day.day !== dto.appointment_date) {
      throw new BadRequestException(
        "A agenda não corresponde ao dia informado.",
      );
    }
    const formattedStartTime = dto.start_time.replace(":", "");

    const startSlot: number = TimeSlot[formattedStartTime];

    if (startSlot === undefined) {
      throw new BadRequestException("Horário inválido.");
    }
    // console.log(
    //   "ue ",
    //   formattedStartTime,
    //   startSlot,
    //   service.duration_minutes / 30,
    //   day,
    // );
    const duration = service.duration_minutes / 30;
    if (startSlot + duration > day.slots.length) {
      throw new BadRequestException(
        "O serviço ultrapassa o horário disponível.",
      );
    }
    for (let i = 0; i < duration; i++) {
      if (day.slots[startSlot + i] !== ScheduleStatus.AVAILABLE) {
        throw new BadRequestException("Horário indisponível.");
      }
    }
    return {
      day,
      startSlot,
      duration,
    };
  }

  async create(dto: CreateAppointmentDto) {
    return this.dataSource.transaction(async (manager) => {
      const collaboratorRepo = manager.getRepository(Collaborator);
      const serviceRepo = manager.getRepository(Service);
      const collaboratorServiceRepo =
        manager.getRepository(CollaboratorService);
      const scheduleRepo = manager.getRepository(Schedule);
      const appointmentRepo = manager.getRepository(Appointment);

      /**
       * 1 - Buscar colaborador
       */
      const collaborator = await collaboratorRepo.findOne({
        where: { id: dto.collaborator_id },
      });

      if (!collaborator) {
        throw new NotFoundException("Colaborador não encontrado.");
      }

      /**
       * 2 - Buscar serviço
       */
      const service = await serviceRepo.findOne({
        where: { id: dto.service_id },
      });

      if (!service) {
        throw new NotFoundException("Serviço não encontrado.");
      }
      if (service.duration_minutes % 30 !== 0) {
        throw new BadRequestException(
          "A duração do serviço deve ser múltipla de 30 minutos.",
        );
      }

      /**
       * 3 - Validar se o colaborador oferece o serviço
       */
      const collaboratorService = await collaboratorServiceRepo.findOne({
        where: {
          collaborator_id: dto.collaborator_id,
          service_id: dto.service_id,
        },
      });

      if (!collaboratorService) {
        throw new BadRequestException(
          "O colaborador não oferece este serviço.",
        );
      }

      /**
       * 4 - Buscar agenda
       */
      const schedule = await scheduleRepo.findOne({
        where: {
          collaborator_id: dto.collaborator_id,
        },
      });

      if (!schedule) {
        throw new NotFoundException("Agenda não encontrada.");
      }

      /**
       * 5 - Validar horários
       */
      const validation = this.validateSchedule(schedule, dto, service);

      /**
       * 6 - Marcar os horários como ocupados
       */
      for (let i = 0; i < validation.duration; i++) {
        validation.day.slots[validation.startSlot + i] =
          ScheduleStatus.OCCUPIED;
      }

      /**
       * 7 - Criar agendamento
       */
      const appointment = appointmentRepo.create({
        ...dto,
        status: AppointmentStatus.SCHEDULED,
      });

      /**
       * 8 - Persistir alterações
       */
      await appointmentRepo.save(appointment);
      await scheduleRepo.save(schedule);

      return appointment;
    });
  }

  findAll() {
    return this.appointmentRepo.find();
  }

  async findOne(id: number) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment)
      throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    Object.assign(appointment, dto);
    return this.appointmentRepo.save(appointment);
  }

  async remove(id: number) {
    const appointment = await this.findOne(id);
    return this.appointmentRepo.remove(appointment);
  }
  async changeStatus(id: number, status: AppointmentStatus) {
    return this.dataSource.transaction(async (manager) => {
      const appointmentRepo = manager.getRepository(Appointment);
      const scheduleRepo = manager.getRepository(Schedule);
      const serviceRepo = manager.getRepository(Service);

      /**
       * 1 - Buscar o agendamento
       */
      const appointment = await appointmentRepo.findOne({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException("Agendamento não encontrado.");
      }

      /**
       * 2 - Não permitir alterar um agendamento finalizado
       */
      if (
        appointment.status === AppointmentStatus.CANCELED ||
        appointment.status === AppointmentStatus.COMPLETED ||
        appointment.status === AppointmentStatus.REFUSED
      ) {
        throw new BadRequestException(
          "Este agendamento não pode mais ser alterado.",
        );
      }

      /**
       * 3 - Buscar serviço
       */
      const service = await serviceRepo.findOne({
        where: {
          id: appointment.service_id,
        },
      });

      if (!service) {
        throw new NotFoundException("Serviço não encontrado.");
      }

      /**
       * 4 - Buscar agenda
       */
      const schedule = await scheduleRepo.findOne({
        where: {
          collaborator_id: appointment.collaborator_id,
        },
      });

      if (!schedule) {
        throw new NotFoundException("Agenda não encontrada.");
      }

      /**
       * 5 - Atualizar agenda
       *
       * Aceitou  -> ocupa horários
       * Cancelou -> libera horários
       * Recusou  -> libera horários
       * Concluiu -> não altera agenda
       */
      switch (status) {
        case AppointmentStatus.CONFIRMED:
          this.updateScheduleSlots(
            schedule,
            appointment,
            service,
            ScheduleStatus.OCCUPIED,
          );
          break;

        case AppointmentStatus.CANCELED:
        case AppointmentStatus.COMPLETED:
        case AppointmentStatus.REFUSED:
          this.updateScheduleSlots(
            schedule,
            appointment,
            service,
            ScheduleStatus.AVAILABLE,
          );
          break;
      }

      /**
       * 6 - Atualizar status
       */
      appointment.status = status;

      /**
       * 7 - Persistir alterações
       */
      await scheduleRepo.save(schedule);
      await appointmentRepo.save(appointment);

      return appointment;
    });
  }
}
