export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequest = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
};

/** REST and realtime clients will be implemented here. */
export type ApiClient = {
  request: <T>(input: ApiRequest) => Promise<T>;
};
