export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  avatar?: string;
  coverUrl?: string;
  status?: string;
  createdAt?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type AuthApiErrorDetail = {
  path: string;
  message: string;
};
