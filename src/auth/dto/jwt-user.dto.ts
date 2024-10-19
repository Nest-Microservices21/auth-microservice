import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTokenDto {
  @IsString()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
