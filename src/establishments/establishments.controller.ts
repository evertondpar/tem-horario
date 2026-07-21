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
import { EstablishmentsService } from "./establishments.service";
import { CreateEstablishmentDto } from "./dto/create-establishment.dto";
import { UpdateEstablishmentDto } from "./dto/update-establishment.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentEstablishment } from "src/auth/decorators/current-establishment.decorator";

@Controller("establishments")
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Post()
  create(@Body() createEstablishmentDto: CreateEstablishmentDto) {
    return this.establishmentsService.create(createEstablishmentDto);
  }

  @Get()
  findAll() {
    return this.establishmentsService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param("id") id: string,
    @CurrentEstablishment() establishment: { id: number; phone: string },
  ) {
    console.log("Estabelecimento logado:", establishment.id);
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
