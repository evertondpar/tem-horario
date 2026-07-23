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
import { SchedulesService } from "./schedules.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { CurrentCollaboratorPayload } from "src/auth/types";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";

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
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch()
  update(
    @Body() updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() collaborator: CurrentCollaboratorPayload,
  ) {
    return this.schedulesService.update(collaborator.id, updateScheduleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.schedulesService.remove(+id);
  }
}
