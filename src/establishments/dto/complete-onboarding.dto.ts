import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Matches,
  IsString,
  Length,
  IsOptional,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @Matches(/^\d{8}$/)
  zip_code: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  address_number: string;

  @IsString()
  address_complement: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cover_position?: number;

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
