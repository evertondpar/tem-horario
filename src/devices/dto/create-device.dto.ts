import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PushPlatform } from "../entities/device.entity";

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsEnum(PushPlatform)
  platform?: PushPlatform;
}
