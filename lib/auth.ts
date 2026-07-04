import { jwtVerify, SignJWT } from 'jose';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error('The environment variable JWT_SECRET is not set.');
  }
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: TokenPayload): Promise<string> {
  const secret = getJwtSecretKey();
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const secret = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export const AUTH_COOKIE_NAME = 'dealdost_token';
