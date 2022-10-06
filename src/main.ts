import { ServerResponse } from 'http';
import vary from 'vary';
import { CorsOptions, NodeRequest, NodeResponse, Origin } from './cors-options';

export type AnyFn = (...args: any[]) => any;

export interface AnyObj {
  [key: string | number]: any;
}

export function middlewareWrapper(options?: CorsOptions) {
  const corsOptions = mergeOptions(options);

  return function corsMiddleware(req: NodeRequest, res: NodeResponse, next: AnyFn) {
    const headersSent = cors(req, res, corsOptions);
    if (headersSent) {
      return;
    }
    next();
  };
}

/**
 * Merges `CorsOptions` with default options.
 */
export function mergeOptions(options?: CorsOptions) {
  const defaults: CorsOptions = {
    origin: '*',
    allowedMethods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  return Object.assign({}, defaults, options);
}

export function cors(req: NodeRequest, res: NodeResponse, options: CorsOptions) {
  if (!options.origin) {
    return false;
  }
  const headers = [];
  const method = req.method?.toUpperCase();

  if (method == 'OPTIONS') {
    // preflight
    headers.push(configureOrigin(options, req));
    headers.push(configureCredentials(options));
    headers.push(configureMethods(options));
    headers.push(configureAllowedHeaders(options, req));
    headers.push(configureMaxAge(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, res);

    if (options.preflightContinue) {
      return false;
    } else {
      // Safari (and potentially other browsers) need content-length 0,
      //   for 204 or they just hang waiting for a body
      res.statusCode = options.optionsSuccessStatus!;
      res.setHeader('Content-Length', '0');
      res.end();
      return true;
    }
  } else {
    // actual response
    headers.push(configureOrigin(options, req));
    headers.push(configureCredentials(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, res);
    return false;
  }
}

function configureOrigin(options: CorsOptions, req: NodeRequest) {
  const requestOrigin = req.headers.origin;
  const headers = [];
  let isAllowed: boolean;

  if (!options.origin || options.origin == '*') {
    // allow any origin
    headers.push([
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
    ]);
  } else if (typeof options.origin == 'string') {
    // fixed origin
    headers.push([
      {
        key: 'Access-Control-Allow-Origin',
        value: options.origin,
      },
    ]);
    headers.push([
      {
        key: 'Vary',
        value: 'Origin',
      },
    ]);
  } else {
    isAllowed = isOriginAllowed(requestOrigin || '', options.origin);
    // reflect origin
    headers.push([
      {
        key: 'Access-Control-Allow-Origin',
        value: isAllowed ? requestOrigin : false,
      },
    ]);
    headers.push([
      {
        key: 'Vary',
        value: 'Origin',
      },
    ]);
  }

  return headers;
}

function configureCredentials(options: CorsOptions) {
  if (options.credentials === true) {
    return {
      key: 'Access-Control-Allow-Credentials',
      value: 'true',
    };
  }
  return null;
}

function configureMethods(options: CorsOptions) {
  let methods = options.allowedMethods;
  if (Array.isArray(methods)) {
    methods = methods.join(','); // .methods is an array, so turn it into a string
  }
  return {
    key: 'Access-Control-Allow-Methods',
    value: methods,
  };
}

function configureAllowedHeaders(options: CorsOptions, req: NodeRequest) {
  let { allowedHeaders } = options;
  const headers = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
    headers.push([
      {
        key: 'Vary',
        value: 'Access-Control-Request-Headers',
      },
    ]);
  } else if (Array.isArray(allowedHeaders)) {
    allowedHeaders = allowedHeaders.join(','); // .headers is an array, so turn it into a string
  }
  if (allowedHeaders && allowedHeaders.length) {
    headers.push([
      {
        key: 'Access-Control-Allow-Headers',
        value: allowedHeaders,
      },
    ]);
  }

  return headers;
}

function configureMaxAge(options: CorsOptions) {
  const maxAge = (typeof options.maxAge == 'number' || options.maxAge) && options.maxAge.toString();
  if (maxAge && maxAge.length) {
    return {
      key: 'Access-Control-Max-Age',
      value: maxAge,
    };
  }
  return null;
}

function configureExposedHeaders(options: CorsOptions) {
  let headers = options.exposedHeaders;
  if (!headers) {
    return null;
  } else if (Array.isArray(headers)) {
    headers = headers.join(','); // .headers is an array, so turn it into a string
  }
  if (headers && headers.length) {
    return {
      key: 'Access-Control-Expose-Headers',
      value: headers,
    };
  }
  return null;
}

function isOriginAllowed(origin: string, allowedOrigin: Origin) {
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true;
      }
    }
    return false;
  } else if (typeof allowedOrigin == 'string') {
    return origin == allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
}

function applyHeaders(headers: any[], res: NodeResponse) {
  for (let i = 0, n = headers.length; i < n; i++) {
    const header = headers[i];
    if (header) {
      if (Array.isArray(header)) {
        applyHeaders(header, res);
      } else if (header.key == 'Vary' && header.value) {
        vary(res as ServerResponse, header.value);
      } else if (header.value) {
        res.setHeader(header.key, header.value);
      }
    }
  }
}
