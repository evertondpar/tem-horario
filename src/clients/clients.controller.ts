import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-establishment.decorator";
import type { CurrentClientPayload } from "../auth/types";

@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get("home")
  getHome() {
    return this.clientsService.getHome();
  }

  @Get("establishments/:id")
  getEstablishment(@Param("id") id: string) {
    return this.clientsService.getEstablishment(+id);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("client")
  getProfile(@CurrentUser() client: CurrentClientPayload) {
    return this.clientsService.findOne(client.id);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("client")
  updateProfile(
    @CurrentUser() client: CurrentClientPayload,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(client.id, dto);
  }

  @Patch("me/photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("client")
  @UseInterceptors(FileInterceptor("file"))
  updatePhoto(
    @CurrentUser() client: CurrentClientPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.clientsService.updatePhoto(client.id, file);
  }
}
