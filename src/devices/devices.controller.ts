import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-establishment.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { CurrentUserPayload } from "../auth/types";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { DevicesService } from "./devices.service";

@Controller("devices")
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(
    @Body() dto: CreateDeviceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.devicesService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.devicesService.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.devicesService.findOne(+id, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateDeviceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.devicesService.update(+id, dto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.devicesService.remove(+id, user);
  }
}
