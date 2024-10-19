import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/mongodb/schemas/user.schema';
import {
  AuthUserDto,
  RegisterUserDto,
  ValidateTokenDto,
  VerifyUserDto,
} from './dto';
import {
  RpcConflictException,
  RpcNotFoundErrorException,
  RpcUnauthorizedException,
} from 'src/common/exceptions/rpc.exception';
import * as argon2 from 'argon2';
import { AuthJwtPayload } from './interfaces/jwt-auth.interface';
import { JwtService } from '@nestjs/jwt';
import jwtRefreshConfig from './config/jwt-refresh.config';
import { ConfigType } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usersModule: Model<User>,
    @Inject(jwtRefreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof jwtRefreshConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    const existingUser = await this.usersModule.findOne({ email }, { _id: 1 });

    if (existingUser)
      throw new RpcConflictException('The user already exists.');

    const result = await this.usersModule.create({
      email,
      name,
      password: await argon2.hash(password),
    });

    return {
      email: result.email,
      name: result.name,
      password: result.password,
    };
  }
  async updateHashedRefreshToken(userId: string, refreshToken: string | null) {
    const updateRefreshToken = this.usersModule.findByIdAndUpdate(userId, {
      refreshToken,
    });
    return updateRefreshToken;
  }
  async validateUser(verifyUserDto: VerifyUserDto) {
    const { email, password } = verifyUserDto;
    const user = await this.usersModule.findOne(
      { email },
      { _id: 1, password: 1, email: 1 },
    );
    if (!user) throw new RpcNotFoundErrorException('User not found.');
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch)
      throw new RpcUnauthorizedException('Invalid Password!');
    return { id: user._id, email: user.email };
  }
  async generateToken(user: AuthUserDto) {
    const payload: AuthJwtPayload = { sub: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.updateHashedRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }
  async loginUser(loginUserDto: AuthUserDto) {
    const tokens = await this.generateToken(loginUserDto);
    return { ...tokens, id: loginUserDto.id };
  }
  async refreshToken(refreshUserDto: AuthUserDto) {
    return this.generateToken(refreshUserDto);
  }
  async validateRefreshToken(tokenDto: ValidateTokenDto) {
    const user = await this.usersModule.findOne(
      { _id: tokenDto.id },
      { email: 1, refreshToken: 1 },
    );
    if (!user) throw new RpcNotFoundErrorException('User not found.');
    const isRefreshTokenValid = await argon2.verify(
      user.refreshToken,
      tokenDto.refreshToken,
    );
    if (!isRefreshTokenValid)
      throw new RpcUnauthorizedException('Invalid refresh token!');
    return { email: user.email, id: tokenDto.id };
  }
  async logout(logoutDto: AuthUserDto) {
    await this.updateHashedRefreshToken(logoutDto.id, null);
    return { message: 'logout successfull' };
  }
}
