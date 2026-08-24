import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import type { CurrentEstablishmentPayload } from "src/auth/types";
import type { CurrentUserPayload } from "src/auth/types";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@Controller("services")
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("establishment")
  create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser()
    establishment: CurrentEstablishmentPayload,
  ) {
    return this.servicesService.create(createServiceDto, establishment.id);
  }

  @Get()
  findAll(
    @CurrentUser()
    user: CurrentUserPayload,
  ) {
    return this.servicesService.findAll(user.establishment_id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  update(@Param("id") id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  remove(@Param("id") id: string) {
    return this.servicesService.remove(+id);
  }
}
