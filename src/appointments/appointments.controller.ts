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
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { ChangeAppointmentStatusDto } from "./dto/change-appointment-status.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type {
  CurrentEstablishmentPayload,
  CurrentUserPayload,
} from "src/auth/types";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@UseGuards(JwtAuthGuard)
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }
  @Patch("status/:id")
  changeStatus(
    @Param("id") id: string,
    @Body() changeStatusDto: ChangeAppointmentStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.changeStatus(
      Number(id),
      changeStatusDto.status,
      user,
    );
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.appointmentsService.findAllForUser(user);
  }

  @UseGuards(RolesGuard)
  @Roles("establishment")
  @Get("collaborators")
  listCollaboratorsAndAppointments(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
  ) {
    console.log(establishment);
    return this.appointmentsService.listCollaboratorsAndAppointments(
      establishment.id,
    );
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  findOne(@Param("id") id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("establishment")
  remove(@Param("id") id: string) {
    return this.appointmentsService.remove(+id);
  }
}
