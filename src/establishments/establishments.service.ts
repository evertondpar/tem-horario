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
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";
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
import { CloudinaryService } from "src/cloudinary/cloudinary.service";

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
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private formatAddress(data: Pick<Establishment, "street" | "address_number" | "address_complement" | "neighborhood" | "city" | "state" | "zip_code">) {
    const street = [data.street, data.address_number].filter(Boolean).join(", ");
    const locality = [data.neighborhood, data.city, data.state].filter(Boolean).join(" - ");
    return [street, data.address_complement, locality, data.zip_code ? `CEP ${data.zip_code}` : ""].filter(Boolean).join(" · ");
  }

  async create(dto: CreateEstablishmentDto) {
    const existing = await this.repo.findOne({ where: { phone: dto.phone } });
    if (existing) throw new BadRequestException("Telefone já cadastrado.");
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const establishment = this.repo.create({
      ...dto,
      password: hashedPassword,
      onboarding_completed: false,
    });
    const saved = await this.repo.save(establishment);
    const { password, ...safeEstablishment } = saved;
    void password;
    return safeEstablishment;
  }

  async getOnboardingStatus(id: number) {
    const [establishment, servicesCount, collaborators] = await Promise.all([
      this.repo.findOne({ where: { id } }),
      this.serviceRepo.count({ where: { establishment_id: id } }),
      this.collaboratorRepo.find({
        where: { establishment_id: id },
        relations: { schedule: true, collaboratorServices: true },
      }),
    ]);
    if (!establishment) {
      throw new NotFoundException("Estabelecimento não encontrado.");
    }
    const hasCollaborator = collaborators.length > 0;
    const hasSchedule = collaborators.some((item) => !!item.schedule);
    const hasAssignedService = collaborators.some(
      (item) => item.collaboratorServices.length > 0,
    );
    return {
      completed: establishment.onboarding_completed,
      steps: {
        profile: !!establishment.address,
        service: servicesCount > 0,
        collaborator: hasCollaborator,
        schedule: hasSchedule,
        assigned_service: hasAssignedService,
      },
    };
  }

  async completeOnboarding(id: number, dto: CompleteOnboardingDto) {
    return this.dataSource.transaction(async (manager) => {
      const establishmentRepo = manager.getRepository(Establishment);
      const serviceRepo = manager.getRepository(Service);
      const collaboratorRepo = manager.getRepository(Collaborator);
      const scheduleRepo = manager.getRepository(Schedule);
      const linkRepo = manager.getRepository(CollaboratorService);

      const establishment = await establishmentRepo.findOne({ where: { id } });
      if (!establishment)
        throw new NotFoundException("Estabelecimento não encontrado.");
      if (establishment.onboarding_completed) {
        throw new BadRequestException("Onboarding já concluído.");
      }
      const openIndex = TimeSlot[dto.open_hour.replace(":", "")];
      const closeIndex = TimeSlot[dto.close_hour.replace(":", "")];
      if (
        openIndex === undefined ||
        closeIndex === undefined ||
        openIndex >= closeIndex
      ) {
        throw new BadRequestException(
          "Horários devem usar intervalos de 30 minutos e a abertura deve ser anterior ao fechamento.",
        );
      }
      if (dto.service_duration_minutes % 30 !== 0) {
        throw new BadRequestException(
          "A duração do serviço deve ser múltipla de 30 minutos.",
        );
      }
      const phoneInUse = await collaboratorRepo.findOne({
        where: { phone: dto.collaborator_phone },
      });
      if (phoneInUse)
        throw new BadRequestException("Telefone do colaborador já cadastrado.");

      const service = await serviceRepo.save(
        serviceRepo.create({
          establishment_id: id,
          name: dto.service_name,
          duration_minutes: dto.service_duration_minutes,
          price: dto.service_price,
        }),
      );
      const collaborator = await collaboratorRepo.save(
        collaboratorRepo.create({
          establishment_id: id,
          name: dto.collaborator_name,
          phone: dto.collaborator_phone,
          password: await bcrypt.hash(dto.collaborator_password, 10),
        }),
      );
      const week: WeekCloseAndOpenHours = Array.from({ length: 6 }, () => ({
        open: dto.open_hour,
        close: dto.close_hour,
      }));
      week.push(null);
      await scheduleRepo.save(
        scheduleRepo.create(generateSchedule(collaborator.id, week)),
      );
      await linkRepo.save(
        linkRepo.create({
          collaborator_id: collaborator.id,
          service_id: service.id,
        }),
      );
      establishment.address = dto.address;
      establishment.zip_code = dto.zip_code.replace(/\D/g, "");
      establishment.street = dto.street;
      establishment.address_number = dto.address_number;
      establishment.address_complement = dto.address_complement;
      establishment.neighborhood = dto.neighborhood;
      establishment.city = dto.city;
      establishment.state = dto.state.toUpperCase();
      establishment.cover_position = dto.cover_position ?? 50;
      establishment.address = this.formatAddress(establishment);
      establishment.open_hour = dto.open_hour;
      establishment.close_hour = dto.close_hour;
      establishment.onboarding_completed = true;
      await establishmentRepo.save(establishment);

      return {
        completed: true,
        service: { id: service.id, name: service.name },
        collaborator: { id: collaborator.id, name: collaborator.name },
      };
    });
  }

  async updatePhoto(id: number, file: Express.Multer.File) {
    const establishment = await this.findOne(id);

    const upload = await this.cloudinaryService.uploadImage(file);
    establishment.photo = upload?.secure_url;

    return this.repo.save(establishment);
  }

  async updateCoverPhoto(id: number, file: Express.Multer.File) {
    const establishment = await this.findOne(id);
    const upload = await this.cloudinaryService.uploadImage(file);
    establishment.cover_photo = upload.secure_url;
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
        zip_code: true,
        street: true,
        address_number: true,
        address_complement: true,
        neighborhood: true,
        city: true,
        state: true,
        photo: true,
        cover_photo: true,
        cover_position: true,
        description: true,
        cancellation_policy: true,
        open_hour: true,
        close_hour: true,
      },
    });
    if (!Establishment)
      throw new NotFoundException(`Establishment ${id} not found`);
    return Establishment;
  }
  async getDashboardInfos(id: number): Promise<DashboardResponse> {
    const establishment = await this.repo.findOne({
      where: { id },
      select: { id: true, name: true, phone: true, photo: true },
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
      establishment,
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
              const currentSlots = collaborator.schedule[day]
                .slots as ScheduleStatus[];
              schedulePayload[day].slots = schedulePayload[day].slots.map(
                (slot, index) =>
                  currentSlots[index] === ScheduleStatus.OCCUPIED
                    ? ScheduleStatus.OCCUPIED
                    : index >= currentOpenIndex &&
                        index < currentCloseIndex &&
                        currentSlots[index] === ScheduleStatus.UNAVAILABLE
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

      const changesAddress = ["zip_code", "street", "address_number", "address_complement", "neighborhood", "city", "state"].some(
        (field) => dto[field as keyof UpdateEstablishmentDto] !== undefined,
      );
      if (changesAddress) {
        Object.assign(establishment, payload);
        establishment.zip_code = establishment.zip_code.replace(/\D/g, "");
        establishment.state = establishment.state.toUpperCase();
        payload.address = this.formatAddress(establishment);
      }

      Object.assign(establishment, payload);
      const updated = await establishmentRepo.save(establishment);
      const { password, ...profile } = updated;
      void password;
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
