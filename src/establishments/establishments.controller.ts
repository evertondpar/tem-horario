import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { EstablishmentsService } from "./establishments.service";
import { CreateEstablishmentDto } from "./dto/create-establishment.dto";
import { UpdateEstablishmentDto } from "./dto/update-establishment.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import type { CurrentEstablishmentPayload } from "src/auth/types";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("establishments")
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Post()
  create(@Body() createEstablishmentDto: CreateEstablishmentDto) {
    return this.establishmentsService.create(createEstablishmentDto);
  }

  @Get("onboarding")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  getOnboardingStatus(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
  ) {
    return this.establishmentsService.getOnboardingStatus(establishment.id);
  }

  @Post("onboarding/complete")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  completeOnboarding(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.establishmentsService.completeOnboarding(establishment.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  @Get("dashboard")
  getDashboardInfos(@CurrentUser() establishment: CurrentEstablishmentPayload) {
    return this.establishmentsService.getDashboardInfos(establishment.id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  @Get("collaborators")
  getCollaborators(@CurrentUser() establishment: CurrentEstablishmentPayload) {
    return this.establishmentsService.getCollaborators(establishment.id);
  }
  @Get()
  findAll() {
    return this.establishmentsService.findAll();
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  getProfile(@CurrentUser() establishment: CurrentEstablishmentPayload) {
    // console.log("Estabelecimento logado:", establishment.id);
    return this.establishmentsService.getProfile(establishment.id);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  updateProfile(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
  ) {
    return this.establishmentsService.updateProfile(
      establishment.id,
      updateEstablishmentDto,
    );
  }

  @Patch("photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  @UseInterceptors(FileInterceptor("file"))
  updatePhoto(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.establishmentsService.updatePhoto(establishment.id, file);
  }

  @Patch("cover-photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  @UseInterceptors(FileInterceptor("file"))
  updateCoverPhoto(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.establishmentsService.updateCoverPhoto(establishment.id, file);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("establishment")
  findOne(
    @Param("id") id: string,
    // @CurrentUser() establishment: { id: number; phone: string },
  ) {
    // console.log("Estabelecimento logado:", establishment.id);
    return this.establishmentsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
  ) {
    return this.establishmentsService.update(+id, updateEstablishmentDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.establishmentsService.remove(+id);
  }
}
