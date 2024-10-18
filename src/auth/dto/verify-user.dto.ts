import {IsEmail,IsString,IsStrongPassword} from "class-validator"
export class VerifyUserDto {
  @IsString()
  @IsEmail()
  email: string  
  
  @IsString()
  @IsStrongPassword()
  password: string
}