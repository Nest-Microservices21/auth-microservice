import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/mongodb/schemas/user.schema';
import { RegisterUserDto } from './dto';
import { RpcConflictException } from 'src/common/exceptions/rpc.exception';
import * as argon2 from 'argon2';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usersModule: Model<User>,
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
}
