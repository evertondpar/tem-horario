import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Appointment,
  AppointmentStatus,
} from "src/appointments/entities/appointment.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { generateSchedule, ScheduleStatus } from "src/helpers/generateSchedule";

dayjs.extend(isoWeek);

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type DayName = (typeof DAYS)[number];
type DaySchedule = { day: string | null; slots: ScheduleStatus[] };

const ISO_WEEKDAY: Record<DayName, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

@Injectable()
export class DevelopmentService {
  constructor(private readonly dataSource: DataSource) {}

  private getDateForDay(day: DayName): string {
    const today = dayjs();
    const diff = (ISO_WEEKDAY[day] - today.isoWeekday() + 7) % 7;
    return today.add(diff, "day").format("YYYY-MM-DD");
  }

  private formatTime(slot: number): string {
    const hour = Math.floor(slot / 2)
      .toString()
      .padStart(2, "0");
    const minutes = slot % 2 === 0 ? "00" : "30";
    return `${hour}:${minutes}`;
  }

  private getDaySchedule(schedule: Schedule, day: DayName): DaySchedule {
    return schedule[day] as DaySchedule;
  }

  async resetSchedules(establishmentId: number) {
    return this.dataSource.transaction(async (manager) => {
      const appointmentRepo = manager.getRepository(Appointment);
      const collaboratorRepo = manager.getRepository(Collaborator);
      const scheduleRepo = manager.getRepository(Schedule);

      const collaborators = await collaboratorRepo.find({
        where: { establishment_id: establishmentId },
        relations: {
          schedule: true,
          collaboratorServices: {
            service: true,
          },
        },
      });

      const deletedAppointments = await appointmentRepo.delete({
        establishment_id: establishmentId,
      });

      const mockAppointments: Appointment[] = [];
      let updatedSchedules = 0;

      for (const collaborator of collaborators) {
        const schedule =
          collaborator.schedule ??
          scheduleRepo.create(generateSchedule(collaborator.id));

        for (const day of DAYS) {
          const currentDay = this.getDaySchedule(schedule, day);
          schedule[day] = {
            ...currentDay,
            day: this.getDateForDay(day),
            slots: currentDay.slots.map((status) =>
              status === ScheduleStatus.OCCUPIED
                ? ScheduleStatus.AVAILABLE
                : status,
            ),
          };
        }

        const service = collaborator.collaboratorServices
          .map((item) => item.service)
          .find(
            (item) =>
              item.duration_minutes > 0 && item.duration_minutes % 30 === 0,
          );

        if (service) {
          const durationSlots = service.duration_minutes / 30;

          for (const day of DAYS) {
            const daySchedule = this.getDaySchedule(schedule, day);
            const startSlot = daySchedule.slots.findIndex(
              (_, index) =>
                index + durationSlots <= daySchedule.slots.length &&
                daySchedule.slots
                  .slice(index, index + durationSlots)
                  .every((status) => status === ScheduleStatus.AVAILABLE),
            );

            if (startSlot === -1) continue;

            for (
              let slot = startSlot;
              slot < startSlot + durationSlots;
              slot++
            ) {
              daySchedule.slots[slot] = ScheduleStatus.OCCUPIED;
            }

            mockAppointments.push(
              appointmentRepo.create({
                establishment_id: establishmentId,
                collaborator_id: collaborator.id,
                service_id: service.id,
                client_name: `Cliente mock ${collaborator.name}`,
                client_phone: `1199000${String(collaborator.id).padStart(4, "0")}`,
                appointment_date: daySchedule.day!,
                start_time: this.formatTime(startSlot),
                end_time: this.formatTime(startSlot + durationSlots),
                status: AppointmentStatus.CONFIRMED,
              }),
            );
            break;
          }
        }

        await scheduleRepo.save(schedule);
        updatedSchedules++;
      }

      if (mockAppointments.length > 0) {
        await appointmentRepo.save(mockAppointments);
      }

      return {
        deletedAppointments: deletedAppointments.affected ?? 0,
        updatedSchedules,
        createdAppointments: mockAppointments.length,
      };
    });
  }
}
