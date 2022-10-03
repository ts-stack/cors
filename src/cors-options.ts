import type * as http from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

export type Origin = boolean | string | RegExp | (boolean | string | RegExp)[];
export type NodeRequest = http.IncomingMessage | Http2ServerRequest;
export type NodeResponse = http.ServerResponse | Http2ServerResponse;

export class CorsOptions {
  /**
   * Configures the `Access-Control-Allow-Origin` CORS header. Default `*`.
   *
   * This option accept following values:
   * 
   * - `boolean` - set `origin` to `true` to reflect [the request origin][1], as defined by `req.header('Origin')`, or set it to `false` to disable CORS.
   * - `string` - set `origin` to a specific origin. For example if you set it to "http://example.com" only requests from "http://example.com" will be allowed.
   * - `RegExp` - set origin to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected.
   * For example the pattern /example\.com$/ will reflect any request that is coming from an origin ending with "example.com".
   * - `Array` - set origin to an array of valid origins. Each origin can be a String or a RegExp. For example ["http://example1.com", /\.example2\.com$/] will
   * accept any request from "http://example1.com" or from a subdomain of "example2.com".
   * - `Function` - set origin to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback (called as
   * callback(err, origin), where origin is a non-function value of the origin option) as the second.
   *
   * [1]: http://tools.ietf.org/html/draft-abarth-origin-09
   */
  origin?: Origin;
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
   * Provides a status code to use for successful OPTIONS requests, since some legacy
   * browsers (IE11, various SmartTVs) choke on `204`.
   * Default `204`.
   */
  optionsSuccessStatus?: number;
}
