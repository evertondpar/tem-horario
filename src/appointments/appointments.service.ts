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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const day: DaySchedule = days[dayjs(dto.appointment_date).day()];
    if (day.day !== dto.appointment_date) {
      throw new BadRequestException(
        "A agenda não corresponde ao dia informado.",
      );
    }
    const formattedStartTime = dto.start_time.replace(":", "");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        day.slots[startSlot + i] !== ScheduleStatus.AVAILABLE
      ) {
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
}
