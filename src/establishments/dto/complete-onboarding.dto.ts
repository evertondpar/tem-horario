import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  open_hour: string;

  @IsString()
  close_hour: string;

  @IsString()
  @IsNotEmpty()
  service_name: string;

  @IsInt()
  @IsPositive()
  service_duration_minutes: number;

  @IsNumber()
  @IsPositive()
  service_price: number;

  @IsString()
  @IsNotEmpty()
  collaborator_name: string;

  @IsString()
  @IsNotEmpty()
  collaborator_phone: string;

  @IsString()
  @MinLength(6)
  collaborator_password: string;
}
