// establishments/dto/create-establishment.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, Min, MinLength } from "class-validator";

export class CreateEstablishmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Matches(/^\d{8}$/)
  zip_code?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  address_number?: string;

  @IsOptional()
  @IsString()
  address_complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  state?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cancellation_policy?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cover_position?: number;

  @IsString()
  @IsNotEmpty()
  open_hour: string;

  @IsString()
  @IsNotEmpty()
  close_hour: string;

  @IsString()
  @MinLength(6)
  password: string;
}
