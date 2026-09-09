import "axios";

import type { AuthApiErrorDetail } from "../../features/auth/authTypes";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  retryOnExpired?: boolean;
};

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: AuthApiErrorDetail[];
};

declare module "axios" {
  export interface AxiosRequestConfig {
    withAuth?: boolean;
    retryOnExpired?: boolean;
  }
}
