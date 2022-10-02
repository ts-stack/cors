export type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];

export type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (err: Error | null, origin?: StaticOrigin) => void
) => void;

export class CorsOptions {
  /**
   * Configures the `Access-Control-Allow-Origin` CORS header. Default `*`
   */
  origin?: StaticOrigin | CustomOrigin;
  /**
   * Configures the `Access-Control-Allow-Methods` CORS header.
   * Expects a comma-delimited string (ex: `GET,PUT,POST`) or an array (ex: `['GET', 'PUT', 'POST']`).
   *
   * Default `GET,HEAD,PUT,PATCH,POST,DELETE`.
   */
  methods?: string | string[];
  /**
   * Configures the `Access-Control-Allow-Headers` CORS header. Expects a comma-delimited string
   * (ex: `Content-Type,Authorization`) or an array (ex: `['Content-Type', 'Authorization']`).
   * If not specified, defaults to reflecting the headers specified in the request's
   * `Access-Control-Request-Headers` header.
   */
  allowedHeaders?: string | string[];
  /**
   * Configures the `Access-Control-Expose-Headers` CORS header. Expects a comma-delimited string
   * (ex: `Content-Range,X-Content-Range`) or an array (ex: `['Content-Range', 'X-Content-Range']`).
   * If not specified, no custom headers are exposed.
   */
  exposedHeaders?: string | string[];
  /**
   * Configures the `Access-Control-Allow-Credentials` CORS header.
   * Set to `true` to pass the header, otherwise it is omitted.
   */
  credentials?: boolean;
  /**
   * Configures the `Access-Control-Max-Age` CORS header.
   * Set to an integer to pass the header, otherwise it is omitted.
   */
  maxAge?: number;
  /**
   * Pass the CORS preflight response to the next handler. Default `false`.
   */
  preflightContinue?: boolean;
  /**
   * Provides a status code to use for successful OPTIONS requests, since some legacy
   * browsers (IE11, various SmartTVs) choke on `204`.
   * Default `204`.
   */
  optionsSuccessStatus?: number;
}
