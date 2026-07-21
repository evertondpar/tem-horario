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

@UseGuards(JwtAuthGuard)
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
  ) {
    return this.collaboratorServiceService.update(
      +id,
      updateCollaboratorServiceDto,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.collaboratorServiceService.remove(+id);
  }
}
