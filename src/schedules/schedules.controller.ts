import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { SchedulesService } from "./schedules.service";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type {
  CurrentCollaboratorPayload,
  CurrentEstablishmentPayload,
  CurrentUserPayload,
} from "src/auth/types";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@UseGuards(JwtAuthGuard)
@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // @Post()
  // create(
  //   @Body() createScheduleDto: CreateScheduleDto,
  //   @CurrentUser() collaborator: CurrentCollaboratorPayload,
  // ) {
  //   return this.schedulesService.create(collaborator.id);
  // }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("collaborator")
  findAll(@CurrentUser() user: CurrentUserPayload) {
    if (user.role === "collaborator") {
      return this.schedulesService.findForCollaborator(user.id);
    }
    return this.schedulesService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles("establishment")
  @Get("collaborators")
  listCollaboratorsAndSchedules(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
  ) {
    console.log(establishment);
    return this.schedulesService.listCollaboratorsAndSchedules(
      establishment.id,
    );
  }
  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  findOne(@Param("id") id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles("collaborator")
  update(
    @Body() updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() collaborator: CurrentCollaboratorPayload,
  ) {
    return this.schedulesService.updateForCollaborator(
      collaborator.id,
      updateScheduleDto,
    );
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  remove(@Param("id") id: string) {
    return this.schedulesService.remove(+id);
  }
}
