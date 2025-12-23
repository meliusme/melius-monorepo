import { Response } from 'express';

export function setAuthCookies(
  res: Response,
  p: {
    accessToken: string;
    refreshToken: string;
    accessExpMs: number;
    refreshExpMs: number;
  },
) {
  const secure = process.env.NODE_ENV === 'production';

  res.cookie('access_token', p.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    expires: new Date(p.accessExpMs),
    path: '/',
  });

  res.cookie('refresh_token', p.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    expires: new Date(p.refreshExpMs),
    path: '/auth/refresh',
  });

  res.cookie('isAuth', true, {
    sameSite: 'lax',
    secure,
    expires: new Date(p.refreshExpMs),
    path: '/',
  });

  res.cookie('access_exp', String(p.accessExpMs), {
    sameSite: 'lax',
    secure,
    expires: new Date(p.accessExpMs),
    path: '/',
  });

  res.cookie('refresh_exp', String(p.refreshExpMs), {
    sameSite: 'lax',
    secure,
    expires: new Date(p.refreshExpMs),
    path: '/',
  });
}

export function clearAuthCookies(res: Response) {
  const secure = process.env.NODE_ENV === 'production';
  const base = { sameSite: 'lax' as const, secure };

  // access
  res.cookie('access_token', '', {
    ...base,
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  // refresh MUST match path used in setAuthCookies
  res.cookie('refresh_token', '', {
    ...base,
    httpOnly: true,
    expires: new Date(0),
    path: '/auth/refresh',
  });

  // public monitoring cookies
  res.cookie('isAuth', false, { ...base, expires: new Date(0), path: '/' });
  res.cookie('access_exp', '', { ...base, expires: new Date(0), path: '/' });
  res.cookie('refresh_exp', '', { ...base, expires: new Date(0), path: '/' });
}
