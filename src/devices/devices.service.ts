import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { CurrentUserPayload } from "../auth/types";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { Device, PushPlatform, UserRole } from "./entities/device.entity";
import { FirebaseService } from "src/firebase/firebase.service";

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private readonly repo: Repository<Device>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(dto: CreateDeviceDto, user: CurrentUserPayload) {
    const existing = await this.repo.findOne({ where: { token: dto.token } });
    const device = existing ?? this.repo.create();
    Object.assign(device, {
      token: dto.token,
      platform: dto.platform ?? PushPlatform.WEB,
      user_id: user.id,
      user_role: user.role as UserRole,
      active: true,
      last_seen_at: new Date(),
    });
    return this.repo.save(device);
  }

  findAll(user: CurrentUserPayload) {
    return this.repo.find({
      where: { user_id: user.id, user_role: user.role as UserRole },
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(id: number, user: CurrentUserPayload) {
    const device = await this.repo.findOne({
      where: {
        id,
        user_id: user.id,
        user_role: user.role as UserRole,
      },
    });
    if (!device) throw new NotFoundException("Dispositivo não encontrado.");
    return device;
  }

  async update(id: number, dto: UpdateDeviceDto, user: CurrentUserPayload) {
    const device = await this.findOne(id, user);
    Object.assign(device, dto, { last_seen_at: new Date() });
    return this.repo.save(device);
  }

  async remove(id: number, user: CurrentUserPayload) {
    const device = await this.findOne(id, user);
    return this.repo.remove(device);
  }

  async sendNotification(
    userId: number,
    userRole: UserRole,
    title: string,
    body: string,
    url: string,
    metadata: Record<string, string> = {},
  ) {
    const devices = await this.repo.find({
      where: { user_id: userId, user_role: userRole, active: true },
    });

    const results = await Promise.all(
      devices.map(async (device) => {
        try {
          await this.firebaseService.sendPush(
            device.token,
            title,
            body,
            url,
            metadata,
          );
          return true;
        } catch (error: unknown) {
          const code =
            error && typeof error === "object" && "code" in error
              ? String(error.code)
              : "unknown";
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token"
          ) {
            await this.repo.update(device.id, { active: false });
          }
          this.logger.warn(
            `Falha ao enviar push para device ${device.id}: ${code}`,
          );
          return false;
        }
      }),
    );

    return {
      total: devices.length,
      sent: results.filter(Boolean).length,
    };
  }

  async notificationTest(user: CurrentUserPayload) {
    return this.sendNotification(
      user.id,
      user.role as UserRole,
      "Teste de notificação",
      "A notificação foi enviada!",
      "/",
    );
  }
}
