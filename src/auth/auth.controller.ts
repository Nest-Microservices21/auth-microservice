import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  RegisterUserDto,
  VerifyUserDto,
  ValidateTokenDto,
  AuthUserDto,
} from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register_user' })
  registerUser(@Payload() createUserDto: RegisterUserDto) {
    return this.authService.registerUser(createUserDto);
  }
  @MessagePattern({ cmd: 'auth.login_user' })
  loginUser(@Payload() loginUserDto: AuthUserDto) {
    return this.authService.loginUser(loginUserDto);
  }
  @MessagePattern({ cmd: 'auth.validate_user' })
  validateUser(@Payload() verifyUserDto: VerifyUserDto) {
    return this.authService.validateUser(verifyUserDto);
  }
  @MessagePattern({ cmd: 'auth.validate_refresh_token' })
  validateRefreshToken(@Payload() tokenDto: ValidateTokenDto) {
    return this.authService.validateRefreshToken(tokenDto);
  }
  @MessagePattern({ cmd: 'auth.refresh_user' })
  refreshUser(@Payload() refreshUserDto: AuthUserDto) {
    return this.authService.refreshToken(refreshUserDto);
  }
  @MessagePattern({ cmd: 'auth.logout_user' })
  logoutUser(@Payload() logoutUserDto: AuthUserDto) {
    return this.authService.logout(logoutUserDto);
  }
}
