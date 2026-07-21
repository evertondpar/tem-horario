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
import * as currentEstablishmentDecorator from "src/auth/decorators/current-establishment.decorator";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createServiceDto: CreateServiceDto,
    @currentEstablishmentDecorator.CurrentEstablishment()
    establishment: currentEstablishmentDecorator.CurrentEstablishmentPayload,
  ) {
    return this.servicesService.create(createServiceDto, establishment.id);
  }

  @Get(":establishmentId")
  findAll(@Param("establishmentId") id: string) {
    return this.servicesService.findAll(id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Param("id") id: string) {
    return this.servicesService.remove(+id);
  }
}
