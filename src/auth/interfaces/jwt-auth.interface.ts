export interface AuthJwtPayload {
  iat?: number;
  sub: string;
  name?: string;
  email: string;
  jti?: string;
  exp?: number;
}
