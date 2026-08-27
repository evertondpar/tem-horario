import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { CurrentUserPayload } from "../auth/types";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { Device, PushPlatform, UserRole } from "./entities/device.entity";
import { FirebaseService } from "src/firebase/firebase.service";

@Injectable()
export class DevicesService {
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
  async notificationTest(user: CurrentUserPayload) {
    const devices = await this.findAll(user);
    console.log("devices: ", devices);
    if (devices?.length >= 1) {
      const ntf = await this.firebaseService.sendPush(
        devices[0].token,
        "Teste Notificaçã",
        "A notificação foi enviada!",
      );
      console.log("ntf ", ntf);
    }

    return true;
  }
}
