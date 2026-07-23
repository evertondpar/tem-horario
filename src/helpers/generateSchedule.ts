import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

export enum ScheduleStatus {
  AVAILABLE = 0,
  OCCUPIED = 1,
  UNAVAILABLE = 2,
}

export interface DaySchedule {
  day: string | null;
  slots: ScheduleStatus[];
}

export interface CollaboratorSchedule {
  collaborator_id: number;

  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const ISO_WEEKDAY: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

function getNextOccurrence(dayName: string, reference = dayjs()): string {
  const targetIso = ISO_WEEKDAY[dayName];
  const currentIso = reference.isoWeekday();
  const diff = (targetIso - currentIso + 7) % 7;
  return reference.add(diff, "day").format("YYYY-MM-DD");
}

function timeToIndex(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 2 + (minute === 30 ? 1 : 0);
}

function generateDay(
  dayName: string,
  open?: string,
  close?: string,
): DaySchedule {
  const slots: ScheduleStatus[] = new Array(48).fill(
    ScheduleStatus.UNAVAILABLE,
  );

  if (open && close) {
    const start = timeToIndex(open);
    const end = timeToIndex(close);

    for (let i = start; i < end; i++) {
      slots[i] = ScheduleStatus.AVAILABLE;
    }
  }

  return {
    day: getNextOccurrence(dayName),
    slots,
  };
}

export function generateSchedule(collaboratorId: number): CollaboratorSchedule {
  const week = [
    { open: "08:00", close: "18:00" }, // Monday
    { open: "08:00", close: "18:00" }, // Tuesday
    { open: "08:00", close: "18:00" }, // Wednesday
    { open: "08:00", close: "18:00" }, // Thursday
    { open: "08:00", close: "18:00" }, // Friday
    { open: "09:00", close: "13:00" }, // Saturday
    null, // Sunday
  ];

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const schedule: any = {
    collaborator_id: collaboratorId,
  };

  days.forEach((day, index) => {
    const config = week[index];

    if (!config) {
      schedule[day] = generateDay(day);
      return;
    }

    schedule[day] = generateDay(day, config.open, config.close);
  });

  return schedule;
}
