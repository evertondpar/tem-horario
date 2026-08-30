import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Client } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Establishment } from "../establishments/entities/establishment.entity";
import { Service } from "../services/entities/service.entity";
import { Collaborator } from "../collaborators/entities/collaborator.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Favorite } from "./entities/favorite.entity";
import { Review } from "./entities/review.entity";
import { Appointment, AppointmentStatus } from "../appointments/entities/appointment.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Device, UserRole } from "../devices/entities/device.entity";

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>,
    @InjectRepository(Establishment)
    private readonly establishmentRepo: Repository<Establishment>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepo: Repository<Collaborator>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async updatePhoto(id: number, file: Express.Multer.File) {
    const client = await this.findOne(id);
    const upload = await this.cloudinaryService.uploadImage(file);
    client.photo = upload.secure_url;
    const saved = await this.repo.save(client);
    const { password, ...safeClient } = saved;
    void password;
    return safeClient;
  }

  async create(dto: CreateClientDto) {
    const existing = await this.repo.findOne({ where: { phone: dto.phone } });
    if (existing) throw new BadRequestException("Telefone já cadastrado.");
    const saved = await this.repo.save(
      this.repo.create({
        ...dto,
        password: await bcrypt.hash(dto.password, 10),
      }),
    );
    const { password, ...safeClient } = saved;
    void password;
    return safeClient;
  }

  async getHome() {
    const [establishments, services, reviews, collaborators] = await Promise.all([
      this.establishmentRepo.find({
        where: { onboarding_completed: true },
        order: { name: "ASC" },
      }),
      this.serviceRepo.find(),
      this.reviewRepo.find(),
      this.collaboratorRepo.find({ relations: { schedule: true } }),
    ]);
    return establishments.map((establishment) => {
      const items = services.filter(
        (service) => service.establishment_id === establishment.id,
      );
      const establishmentReviews = reviews.filter(
        (review) => review.establishment_id === establishment.id,
      );
      const nextAvailable = collaborators
        .filter((collaborator) => collaborator.establishment_id === establishment.id && collaborator.schedule)
        .flatMap((collaborator) => ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].flatMap((weekday) => {
          const day = collaborator.schedule?.[weekday] as { day: string | null; slots: number[] } | undefined;
          if (!day?.day) return [];
          const index = day.slots.findIndex((status) => status === 0);
          return index >= 0 ? [`${day.day}T${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`] : [];
        }))
        .filter((value) => new Date(value) >= new Date())
        .sort()[0] ?? null;
      return {
        ...establishment,
        service_count: items.length,
        service_names: items.map((item) => item.name),
        starting_price:
          items.length > 0
            ? Math.min(...items.map((item) => Number(item.price)))
            : null,
        review_count: establishmentReviews.length,
        rating:
          establishmentReviews.length > 0
            ? establishmentReviews.reduce((sum, review) => sum + review.rating, 0) /
              establishmentReviews.length
            : null,
        next_available: nextAvailable,
      };
    });
  }

  async getEstablishment(id: number) {
    type PublicDaySchedule = { day: string | null; slots: number[] };
    const nowParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .reduce<Record<string, string>>((parts, part) => {
        if (part.type !== "literal") parts[part.type] = part.value;
        return parts;
      }, {});
    const today = `${nowParts.year}-${nowParts.month}-${nowParts.day}`;
    const currentMinutes =
      Number(nowParts.hour) * 60 +
      Number(nowParts.minute) +
      Number(nowParts.second) / 60;
    const weekdays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;

    const establishment = await this.establishmentRepo.findOne({
      where: { id },
    });
    if (!establishment)
      throw new NotFoundException("Estabelecimento não encontrado.");
    if (!establishment.onboarding_completed) {
      throw new NotFoundException("Estabelecimento ainda não está disponível.");
    }
    const [services, collaborators] = await Promise.all([
      this.serviceRepo.find({ where: { establishment_id: id } }),
      this.collaboratorRepo.find({
        where: { establishment_id: id },
        relations: { schedule: true, collaboratorServices: true },
      }),
    ]);
    return {
      establishment,
      services,
      collaborators: collaborators.map(({ collaboratorServices, ...item }) => {
        const publicSchedule = item.schedule
          ? {
              ...item.schedule,
              ...Object.fromEntries(
                weekdays.map((weekday) => {
                  const day = item.schedule[
                    weekday
                  ] as PublicDaySchedule | null;
                  return [
                    weekday,
                    day?.day === today
                      ? {
                          ...day,
                          slots: day.slots.map((status, index) =>
                            index * 30 < currentMinutes ? 2 : status,
                          ),
                        }
                      : day,
                  ];
                }),
              ),
            }
          : null;

        return {
          ...item,
          schedule: publicSchedule,
          service_ids: collaboratorServices.map((link) => link.service_id),
        };
      }),
    };
  }

  async findOne(id: number) {
    const client = await this.repo.findOne({ where: { id } });
    if (!client) throw new NotFoundException("Cliente não encontrado.");
    return client;
  }

  async getFavorites(clientId: number) {
    const favorites = await this.favoriteRepo.find({ where: { client_id: clientId } });
    return favorites.map((item) => item.establishment_id);
  }

  async addFavorite(clientId: number, establishmentId: number) {
    const establishment = await this.establishmentRepo.findOne({ where: { id: establishmentId, onboarding_completed: true } });
    if (!establishment) throw new NotFoundException("Estabelecimento não encontrado.");
    const existing = await this.favoriteRepo.findOne({ where: { client_id: clientId, establishment_id: establishmentId } });
    if (existing) return existing;
    return this.favoriteRepo.save(this.favoriteRepo.create({ client_id: clientId, establishment_id: establishmentId }));
  }

  async removeFavorite(clientId: number, establishmentId: number) {
    await this.favoriteRepo.delete({ client_id: clientId, establishment_id: establishmentId });
    return { removed: true };
  }

  async getReviews(establishmentId: number) {
    const reviews = await this.reviewRepo.find({ where: { establishment_id: establishmentId }, order: { createdAt: "DESC" } });
    const clientIds = [...new Set(reviews.map((review) => review.client_id))];
    const clients = clientIds.length ? await this.repo.findBy({ id: In(clientIds) }) : [];
    const names = new Map(clients.map((client) => [client.id, client.name]));
    return reviews.map((review) => ({ ...review, client_name: names.get(review.client_id) ?? "Cliente" }));
  }

  async saveReview(clientId: number, establishmentId: number, dto: CreateReviewDto) {
    const completed = await this.appointmentRepo.exists({
      where: { client_id: clientId, establishment_id: establishmentId, status: AppointmentStatus.COMPLETED },
    });
    if (!completed) throw new BadRequestException("Conclua um atendimento antes de avaliar este estabelecimento.");
    const existing = await this.reviewRepo.findOne({ where: { client_id: clientId, establishment_id: establishmentId } });
    return this.reviewRepo.save(this.reviewRepo.create({ ...existing, client_id: clientId, establishment_id: establishmentId, rating: dto.rating, comment: dto.comment?.trim() || null }));
  }

  async removeAccount(clientId: number) {
    const client = await this.findOne(clientId);
    await this.appointmentRepo.update({ client_id: clientId }, { client_id: null });
    await this.favoriteRepo.delete({ client_id: clientId });
    await this.reviewRepo.delete({ client_id: clientId });
    await this.deviceRepo.delete({ user_id: clientId, user_role: UserRole.CLIENT });
    await this.repo.remove(client);
    return { removed: true };
  }

  async update(id: number, dto: UpdateClientDto) {
    const client = await this.findOne(id);
    const payload = { ...dto };
    if (payload.password)
      payload.password = await bcrypt.hash(payload.password, 10);
    else delete payload.password;
    Object.assign(client, payload);
    const saved = await this.repo.save(client);
    const { password, ...safeClient } = saved;
    void password;
    return safeClient;
  }
}
