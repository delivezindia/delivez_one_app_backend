import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env.js';

export interface TokenPayload extends JwtPayload {
  sub: string;
}

export const createAccessToken = (userId: string, rememberMe = false) => {
  const expiresIn = rememberMe ? env.JWT_REMEMBER_ME_EXPIRES_IN : env.JWT_EXPIRES_IN;

  const token = jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });

  return { token, expiresIn };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
