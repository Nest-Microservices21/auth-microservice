import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto, VerifyUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register_user' })
  registerUser(@Payload() createUserDto: RegisterUserDto) {
    return this.authService.registerUser(createUserDto);
  }
  @MessagePattern({ cmd: 'auth.login_user' })
  loginUser(@Payload() loginUserDto:LoginUserDto) {
    return this.authService.loginUser(loginUserDto)
  }
  @MessagePattern({ cmd: 'auth.validate_user' })
  validateUser(@Payload() verifyUserDto: VerifyUserDto) {
    return this.authService.validateUser(verifyUserDto);
  }
 
}
