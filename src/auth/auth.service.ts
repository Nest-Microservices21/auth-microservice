import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/mongodb/schemas/user.schema';
import { LoginUserDto, RegisterUserDto, VerifyUserDto } from './dto';
import {
  RpcConflictException,
  RpcUnauthorizedException,
} from 'src/common/exceptions/rpc.exception';
import * as argon2 from 'argon2';
import { AuthJwtPayload } from './interfaces/jwt-auth.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usersModule: Model<User>,
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
  async validateUser(verifyUserDto: VerifyUserDto) {
    const { email, password } = verifyUserDto;
    const user = await this.usersModule.findOne(
      { email },
      { _id: 1, password: 1, email: 1 },
    );
    if (!user) throw new RpcUnauthorizedException('User not found.');
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch)
      throw new RpcUnauthorizedException('Invalid Password!');
    return { id: user._id, email: user.email };
  }
  async generateToken(user: LoginUserDto) {
    const payload: AuthJwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, email: payload.email, id: payload.sub };
  }
  async loginUser(loginUserDto: LoginUserDto) {
    return this.generateToken(loginUserDto);
  }
}
