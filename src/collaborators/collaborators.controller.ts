import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CollaboratorsService } from "./collaborators.service";
import { CreateCollaboratorDto } from "./dto/create-collaborator.dto";
import { UpdateCollaboratorDto } from "./dto/update-collaborator.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import type {
  CurrentCollaboratorPayload,
  CurrentEstablishmentPayload,
} from "src/auth/types";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("establishment")
@Controller("collaborators")
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post()
  create(
    @Body() createCollaboratorDto: CreateCollaboratorDto,
    @CurrentUser() establishment: CurrentEstablishmentPayload,
  ) {
    return this.collaboratorsService.create(
      createCollaboratorDto,
      establishment.id,
    );
  }

  @Get()
  findAll(@CurrentUser() establishment: CurrentEstablishmentPayload) {
    return this.collaboratorsService.findAll(establishment.id);
  }

  @Get("dashboard")
  @Roles("collaborator")
  getDashboard(@CurrentUser() collaborator: CurrentCollaboratorPayload) {
    return this.collaboratorsService.getDashboard(collaborator.id);
  }

  @Patch(":id/photo")
  @UseInterceptors(FileInterceptor("file"))
  updatePhoto(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() establishment: CurrentEstablishmentPayload,
  ) {
    return this.collaboratorsService.updatePhoto(+id, establishment.id, file);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.collaboratorsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCollaboratorDto: UpdateCollaboratorDto,
  ) {
    return this.collaboratorsService.update(+id, updateCollaboratorDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.collaboratorsService.remove(+id);
  }
}
