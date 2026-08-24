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
import { CollaboratorServiceService } from "./collaborator-service.service";
import { CreateCollaboratorServiceDto } from "./dto/create-collaborator-service.dto";
import { UpdateCollaboratorServiceDto } from "./dto/update-collaborator-service.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { CurrentCollaboratorPayload } from "src/auth/types";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("collaborator")
@Controller("collaborator-service")
export class CollaboratorServiceController {
  constructor(
    private readonly collaboratorServiceService: CollaboratorServiceService,
  ) {}

  @Post()
  create(
    @Body() createCollaboratorServiceDto: CreateCollaboratorServiceDto,
    @CurrentUser() collaborator: CurrentCollaboratorPayload,
  ) {
    return this.collaboratorServiceService.create(
      createCollaboratorServiceDto,
      collaborator.id,
      collaborator.establishment_id,
    );
  }

  @Get()
  findAll(@CurrentUser() collaborator: CurrentCollaboratorPayload) {
    return this.collaboratorServiceService.findAll(collaborator.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.collaboratorServiceService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCollaboratorServiceDto: UpdateCollaboratorServiceDto,
    @CurrentUser() collaborator: CurrentCollaboratorPayload,
  ) {
    return this.collaboratorServiceService.updateOwned(
      +id,
      updateCollaboratorServiceDto,
      collaborator.id,
      collaborator.establishment_id,
    );
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() collaborator: CurrentCollaboratorPayload,
  ) {
    return this.collaboratorServiceService.removeOwned(+id, collaborator.id);
  }
}
