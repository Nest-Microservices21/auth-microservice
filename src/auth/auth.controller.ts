import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register_user' })
  registerUser(@Payload() createUserDto:RegisterUserDto) {
    return this.authService.registerUser(createUserDto)
  }
  @MessagePattern({ cmd: 'auth.login_user' })
  loginUser() {
    return 'login user';
  }
  @MessagePattern({ cmd: 'auth.verify_user' })
  verifyUser() {
    return 'verify user';
  }
}
