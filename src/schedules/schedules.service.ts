// schedules/schedules.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Schedule } from "./entities/schedule.entity";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { generateSchedule, ScheduleStatus } from "src/helpers/generateSchedule";

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly repo: Repository<Schedule>,
  ) {}

  async create(collaborator_id: number): Promise<Schedule> {
    const exists = await this.repo.findOne({
      where: { collaborator_id: collaborator_id },
    });
    if (exists?.id) {
      throw new BadRequestException("Agenda já existe");
    }
    // console.log("uee ", generateSchedule(collaborator_id));
    // return true;
    const payload = generateSchedule(collaborator_id);
    const schedule = this.repo.create(payload);
    return this.repo.save({ ...schedule, collaborator_id: collaborator_id });
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const schedule = await this.repo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule ${id} not found`);
    return schedule;
  }

  async update(id: number, dto: UpdateScheduleDto) {
    const schedule = await this.findOne(id);

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;

    for (const day of days) {
      // Se o frontend não enviou esse dia, não há o que validar.
      if (!dto[day]) continue;

      const currentDay = schedule[day];
      const updatedDay = dto[day];

      /**
       * Validação 1
       * O dia deve possuir exatamente 48 horários.
       */
      if (updatedDay.slots.length !== 48) {
        throw new BadRequestException(
          `${day} deve possuir exatamente 48 horários.`,
        );
      }

      /**
       * Validação 2
       * Os valores enviados devem ser apenas:
       * AVAILABLE (0)
       * OCCUPIED (1)
       * UNAVAILABLE (2)
       */
      for (const status of updatedDay.slots) {
        if (!Object.values(ScheduleStatus).includes(status)) {
          throw new BadRequestException(
            `Status inválido encontrado em ${day}.`,
          );
        }
      }

      /**
       * Validação 3
       * Não permitir alterar horários ocupados.
       *
       * Se um horário já estiver OCCUPIED, ele deve continuar OCCUPIED.
       */
      for (let i = 0; i < 48; i++) {
        if (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          currentDay.slots[i] === ScheduleStatus.OCCUPIED &&
          updatedDay.slots[i] !== ScheduleStatus.OCCUPIED
        ) {
          throw new BadRequestException(
            `Não é permitido alterar horários ocupados (${day}).`,
          );
        }
      }
    }

    for (const day of days) {
      if (!dto[day]) continue;
      schedule[day] = {
        ...schedule[day],
        slots: dto[day].slots,
      };
    }

    return this.repo.save(schedule);
  }

  async remove(id: number) {
    const schedule = await this.findOne(id);
    return this.repo.remove(schedule);
  }
}
