import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true, default: null })
  jti: string | null;

  @Prop({ default: null })
  expiresAt: Date | null;
}
export const UserSchema = SchemaFactory.createForClass(User);
