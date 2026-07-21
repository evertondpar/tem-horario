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
import { CollaboratorsService } from "./collaborators.service";
import { CreateCollaboratorDto } from "./dto/create-collaborator.dto";
import { UpdateCollaboratorDto } from "./dto/update-collaborator.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import type { CurrentEstablishmentPayload } from "src/auth/types";

@UseGuards(JwtAuthGuard)
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
