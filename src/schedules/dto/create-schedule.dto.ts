/* eslint-disable @typescript-eslint/no-unsafe-call */
// schedules/dto/create-schedule.dto.ts
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ScheduleStatus } from "src/helpers/generateSchedule";
export class CreateDayScheduleDto {
  @IsString()
  @IsOptional()
  day?: string;

  @IsArray()
  @ArrayMinSize(48)
  @ArrayMaxSize(48)
  slots: ScheduleStatus[];
}
export class CreateScheduleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  monday?: CreateDayScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  tuesday?: CreateDayScheduleDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  wednesday?: CreateDayScheduleDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  thursday?: CreateDayScheduleDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  friday?: CreateDayScheduleDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  saturday?: CreateDayScheduleDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDayScheduleDto)
  sunday?: CreateDayScheduleDto;
}
