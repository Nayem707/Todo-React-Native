import { authService } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/httpResponse.js";
import { env } from "../../config/env.js";
import { COOKIE_NAMES } from "../../constants/index.js";
import { durationToMs } from "../../utils/duration.js";

const baseCookie = {
  httpOnly: true,
  signed: true,
  sameSite: env.COOKIE_SAMESITE,
  secure: env.COOKIE_SECURE,
  domain: env.COOKIE_DOMAIN || undefined,
};

const accessCookieOptions = {
  ...baseCookie,
  path: "/",
  maxAge: durationToMs(env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000),
};

const refreshCookieOptions = {
  ...baseCookie,
  path: "/api/auth",
  maxAge: durationToMs(env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000),
};

const readRefreshToken = (req) =>
  req.body?.refreshToken ||
  req.signedCookies?.[COOKIE_NAMES.REFRESH_TOKEN] ||
  req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];

const setSessionCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, accessCookieOptions);
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, refreshCookieOptions);
};

const clearSessionCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
  });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    path: "/api/auth",
    domain: env.COOKIE_DOMAIN || undefined,
  });
};

export const authController = {
  register: asyncHandler(async (req, res) => {
    const payload = await authService.register(req.body);
    setSessionCookies(res, payload);
    created(res, payload);
  }),

  login: asyncHandler(async (req, res) => {
    const payload = await authService.login(req.body);
    setSessionCookies(res, payload);
    ok(res, payload);
  }),

  refresh: asyncHandler(async (req, res) => {
    const payload = await authService.refresh(readRefreshToken(req));
    setSessionCookies(res, payload);
    ok(res, payload);
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout({
      accessJti: req.tokenPayload?.jti,
      accessExp: req.tokenPayload?.exp,
      refreshToken: readRefreshToken(req),
    });
    clearSessionCookies(res);
    ok(res, { message: "Logged out." });
  }),

  me: asyncHandler(async (req, res) => {
    ok(res, await authService.me(req.user));
  }),
};
