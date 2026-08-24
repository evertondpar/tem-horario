import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-establishment.decorator";
import type { CurrentEstablishmentPayload } from "src/auth/types";
import { DevelopmentService } from "./development.service";

@UseGuards(JwtAuthGuard)
@Controller("development")
export class DevelopmentController {
  constructor(private readonly developmentService: DevelopmentService) {}

  /**
   * Rota exclusiva para popular o ambiente de desenvolvimento com dados atuais.
   * Ela apaga os agendamentos do estabelecimento autenticado.
   */
  @Post("reset-schedules")
  resetSchedules(
    @CurrentUser() establishment: CurrentEstablishmentPayload,
  ) {
    return this.developmentService.resetSchedules(establishment.id);
  }
}
