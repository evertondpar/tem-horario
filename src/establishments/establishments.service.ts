/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Establishments/Establishments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
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
import { DashboardResponse, ListCollaboratorsResponse } from "./types";
import { CollaboratorService } from "src/collaborator-service/entities/collaborator-service.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import {
  generateSchedule,
  ScheduleStatus,
  TimeSlot,
  WeekCloseAndOpenHours,
} from "src/helpers/generateSchedule";

@Injectable()
export class EstablishmentsService {
  constructor(
    @InjectRepository(Establishment)
    private readonly repo: Repository<Establishment>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepo: Repository<Collaborator>,
    @InjectRepository(CollaboratorService)
    private readonly collaboratorServiceRepo: Repository<CollaboratorService>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly dataSource: DataSource,
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
  async getProfile(id: number) {
    const Establishment = await this.repo.findOne({
      where: { id },
      select: {
        name: true,
        phone: true,
        address: true,
        photo: true,
        open_hour: true,
        close_hour: true,
      },
    });
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
  async getCollaborators(id: number): Promise<ListCollaboratorsResponse> {
    const establishment = await this.repo.exists({
      where: { id },
    });

    if (!establishment) {
      throw new NotFoundException("Estabelecimento não encontrado.");
    }

    const collaborators = await this.collaboratorRepo.find({
      where: {
        establishment_id: id,
      },
      relations: {
        collaboratorServices: {
          service: true,
        },
      },
    });
    return {
      collaborators: collaborators.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ password, collaboratorServices, ...collaborator }) => ({
          ...collaborator,
          services: collaboratorServices.map((cs) => cs.service),
        }),
      ),
    };
  }

  async updateProfile(id: number, dto: UpdateEstablishmentDto) {
    const payload: Partial<UpdateEstablishmentDto> = { ...dto };
    return this.dataSource.transaction(async (manager) => {
      const establishmentRepo = manager.getRepository(Establishment);
      const appointmentRepo = manager.getRepository(Appointment);
      const collaboratorRepo = manager.getRepository(Collaborator);
      const scheduleRepo = manager.getRepository(Schedule);

      const establishment = await establishmentRepo.findOne({ where: { id } });
      if (!establishment) {
        throw new NotFoundException(`Establishment ${id} not found`);
      }

      const changesWorkingHours =
        dto.open_hour !== undefined || dto.close_hour !== undefined;

      if (changesWorkingHours) {
        const newOpen = dto.open_hour ?? establishment.open_hour;
        const newClose = dto.close_hour ?? establishment.close_hour;
        const currentOpenIndex =
          TimeSlot[establishment.open_hour.replace(":", "")];
        const currentCloseIndex =
          TimeSlot[establishment.close_hour.replace(":", "")];
        const newOpenIndex = TimeSlot[newOpen.replace(":", "")];
        const newCloseIndex = TimeSlot[newClose.replace(":", "")];

        if (
          newOpenIndex === undefined ||
          newCloseIndex === undefined ||
          newOpenIndex >= newCloseIndex
        ) {
          throw new BadRequestException(
            "O horário de abertura deve ser anterior ao horário de fechamento e usar intervalos de 30 minutos.",
          );
        }

        const appointments = await appointmentRepo.find({
          where: {
            establishment_id: id,
            status: In([
              AppointmentStatus.SCHEDULED,
              AppointmentStatus.CONFIRMED,
            ]),
          },
        });

        const hasConflict = appointments.some((appointment) => {
          const startIndex = TimeSlot[appointment.start_time.replace(":", "")];
          const endIndex = TimeSlot[appointment.end_time.replace(":", "")];

          return startIndex < newOpenIndex || endIndex > newCloseIndex;
        });

        if (hasConflict) {
          throw new BadRequestException(
            "Existem agendamentos fora do novo horário de funcionamento.",
          );
        }

        const week: WeekCloseAndOpenHours = Array.from({ length: 6 }, () => ({
          open: newOpen,
          close: newClose,
        }));
        week.push(null);

        const collaborators = await collaboratorRepo.find({
          where: { establishment_id: id },
          relations: { schedule: true },
        });

        await Promise.all(
          collaborators.map((collaborator) => {
            if (!collaborator.schedule) {
              throw new NotFoundException(
                `Agenda do colaborador ${collaborator.id} não encontrada.`,
              );
            }

            const schedulePayload = generateSchedule(collaborator.id, week);
            const days = [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ] as const;

            for (const day of days) {
              schedulePayload[day].slots = schedulePayload[day].slots.map(
                (slot, index) =>
                  collaborator.schedule[day].slots[index] ===
                  ScheduleStatus.OCCUPIED
                    ? ScheduleStatus.OCCUPIED
                    : index >= currentOpenIndex &&
                        index < currentCloseIndex &&
                        collaborator.schedule[day].slots[index] ===
                          ScheduleStatus.UNAVAILABLE
                      ? ScheduleStatus.UNAVAILABLE
                      : slot,
              );
            }

            return scheduleRepo.save({
              id: collaborator.schedule.id,
              ...schedulePayload,
            });
          }),
        );
      }

      if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, 10);
      }

      Object.assign(establishment, payload);
      const updated = await establishmentRepo.save(establishment);
      const { password, ...profile } = updated;
      return profile;
    });
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
