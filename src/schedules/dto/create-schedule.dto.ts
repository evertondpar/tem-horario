/* eslint-disable @typescript-eslint/no-unsafe-call */
// schedules/dto/create-schedule.dto.ts
import { IsInt, IsObject, IsOptional, IsPositive } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @IsPositive()
  collaborator_id: number;

  @IsOptional()
  @IsObject()
  monday?: Record<string, any>;

  @IsOptional()
  @IsObject()
  tuesday?: Record<string, any>;

  @IsOptional()
  @IsObject()
  wednesday?: Record<string, any>;

  @IsOptional()
  @IsObject()
  thursday?: Record<string, any>;

  @IsOptional()
  @IsObject()
  friday?: Record<string, any>;

  @IsOptional()
  @IsObject()
  saturday?: Record<string, any>;

  @IsOptional()
  @IsObject()
  sunday?: Record<string, any>;
}
