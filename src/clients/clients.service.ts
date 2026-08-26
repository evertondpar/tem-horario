import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Client } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Establishment } from "../establishments/entities/establishment.entity";
import { Service } from "../services/entities/service.entity";
import { Collaborator } from "../collaborators/entities/collaborator.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

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
    const [establishments, services] = await Promise.all([
      this.establishmentRepo.find({
        where: { onboarding_completed: true },
        order: { name: "ASC" },
      }),
      this.serviceRepo.find(),
    ]);
    return establishments.map((establishment) => {
      const items = services.filter(
        (service) => service.establishment_id === establishment.id,
      );
      return {
        ...establishment,
        service_count: items.length,
        starting_price:
          items.length > 0
            ? Math.min(...items.map((item) => Number(item.price)))
            : null,
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
