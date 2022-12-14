/// <reference path="./index.d.ts" />
import * as assert from 'assert';
import after from 'after';
import { Request, Response } from 'express';

import { CorsOptions, middlewareWrapper } from '../src';
import { FakeRequest } from './fake-request';
import { FakeResponse } from './fake-response';
import { AnyObj } from '../src/main';

process.env.NODE_ENV = 'test';

const fakeRequest = function (method?: string, headers?: AnyObj) {
  return new FakeRequest(method, headers) as Request;
};

const fakeResponse = function () {
  return new FakeResponse() as unknown as Response;
};

describe('cors', function () {
  it('does not alter `options` configuration object', function () {
    const options = Object.freeze({
      origin: 'custom-origin',
    });
    assert.doesNotThrow(function () {
      middlewareWrapper(options);
    });
  });

  it('passes control to next middleware', function (done) {
    // arrange
    const req = fakeRequest('GET');
    const res = fakeResponse();
    const next = function () {
      done();
    };

    // act
    middlewareWrapper()(req, res, next);
  });

  it('shortcircuits preflight requests', function (done) {
    const cb = after(1, done);
    const req = fakeRequest('OPTIONS');
    const res = fakeResponse();

    res.on('finish', function () {
      assert.strictEqual(res.statusCode, 204);
      cb();
    });

    middlewareWrapper()(req, res, function (err) {
      cb(err || new Error('should not be called'));
    });
  });

  it('can configure preflight success response status code', function (done) {
    const cb = after(1, done);
    const req = fakeRequest('OPTIONS');
    const res = fakeResponse();

    res.on('finish', function () {
      assert.strictEqual(res.statusCode, 200);
      cb();
    });

    // act
    middlewareWrapper({ optionsSuccessStatus: 200 })(req, res, function (err) {
      cb(err || new Error('should not be called'));
    });
  });

  it("doesn't shortcircuit preflight requests with preflightContinue option", function (done) {
    const cb = after(1, done);
    const req = fakeRequest('OPTIONS');
    const res = fakeResponse();

    res.on('finish', function () {
      cb(new Error('should not be called'));
    });

    middlewareWrapper({ preflightContinue: true })(req, res, function (err) {
      if (err) return cb(err);
      setTimeout(cb, 10);
    });
  });

  it('normalizes method names', function (done) {
    const cb = after(1, done);
    const req = fakeRequest('options');
    const res = fakeResponse();

    res.on('finish', function () {
      assert.strictEqual(res.statusCode, 204);
      cb();
    });

    middlewareWrapper()(req, res, function (err) {
      cb(err || new Error('should not be called'));
    });
  });

  it('includes Content-Length response header', function (done) {
    const cb = after(1, done);
    const req = fakeRequest('OPTIONS');
    const res = fakeResponse();

    res.on('finish', function () {
      assert.strictEqual(res.getHeader('Content-Length'), '0');
      cb();
    });

    middlewareWrapper()(req, res, function (err) {
      cb(err || new Error('should not be called'));
    });
  });

  it('no options enables default CORS to all origins', function (done) {
    // arrange
    const req = fakeRequest('GET');
    const res = fakeResponse();
    const next = function () {
      // assert
      assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
      assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), undefined);
      done();
    };

    // act
    middlewareWrapper()(req, res, next);
  });

  it('OPTION call with no options enables default CORS to all origins and methods', function (done) {
    const cb = after(1, done);
    const req = fakeRequest('OPTIONS');
    const res = fakeResponse();

    res.on('finish', function () {
      assert.strictEqual(res.statusCode, 204);
      assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
      assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'GET,HEAD,PUT,PATCH,POST,DELETE');
      cb();
    });

    middlewareWrapper()(req, res, function (err) {
      cb(err || new Error('should not be called'));
    });
  });

  describe('passing static options', function () {
    it('overrides defaults', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();
      const options: CorsOptions = {
        origin: 'http://example.com',
        allowedMethods: ['FOO', 'bar'],
        allowedHeaders: ['FIZZ', 'buzz'],
        allowCredentials: true,
        maxAge: 123,
      };

      res.on('finish', function () {
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), 'http://example.com');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'FOO,bar');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'FIZZ,buzz');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Credentials'), 'true');
        assert.strictEqual(res.getHeader('Access-Control-Max-Age'), '123');
        cb();
      });

      middlewareWrapper(options)(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('matches request origin against regexp', function (done) {
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const options: CorsOptions = { origin: /:\/\/(.+\.)?example.com$/ };
      middlewareWrapper(options)(req, res, function (err) {
        assert.ifError(err);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), req.headers.origin);
        assert.strictEqual(res.getHeader('Vary'), 'Origin');
        return done();
      });
    });

    it('matches request origin against array of origin checks', function (done) {
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const options: CorsOptions = { origin: [/foo\.com$/, 'http://example.com'] };
      middlewareWrapper(options)(req, res, function (err) {
        assert.ifError(err);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), req.headers.origin);
        assert.strictEqual(res.getHeader('Vary'), 'Origin');
        return done();
      });
    });

    it("doesn't match request origin against array of invalid origin checks", function (done) {
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const options: CorsOptions = { origin: [/foo\.com$/, 'bar.com'] };
      middlewareWrapper(options)(req, res, function (err) {
        assert.ifError(err);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), undefined);
        assert.strictEqual(res.getHeader('Vary'), 'Origin');
        return done();
      });
    });

    it('origin of false disables cors', function (done) {
      // arrange
      const options: CorsOptions = {
        origin: false,
        allowedMethods: ['FOO', 'bar'],
        allowedHeaders: ['FIZZ', 'buzz'],
        allowCredentials: true,
        maxAge: 123,
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Credentials'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Max-Age'), undefined);
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('can override origin', function (done) {
      // arrange
      const options: CorsOptions = {
        origin: 'http://example.com',
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), 'http://example.com');
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('includes Vary header for specific origins', function (done) {
      // arrange
      const options: CorsOptions = {
        origin: 'http://example.com',
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Vary'), 'Origin');
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('appends to an existing Vary header', function (done) {
      // arrange
      const options: CorsOptions = {
        origin: 'http://example.com',
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      res.setHeader('Vary', 'Foo');
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Vary'), 'Foo, Origin');
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('origin defaults to *', function (done) {
      // arrange
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
        done();
      };

      // act
      middlewareWrapper()(req, res, next);
    });

    it('specifying true for origin reflects requesting origin', function (done) {
      // arrange
      const options: CorsOptions = {
        origin: true,
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), 'http://example.com');
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('can override methods', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();
      const options: CorsOptions = {
        allowedMethods: ['method1', 'method2'],
      };

      res.on('finish', function () {
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'method1,method2');
        cb();
      });

      middlewareWrapper(options)(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('methods defaults to GET, HEAD, PUT, PATCH, POST, DELETE', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'GET,HEAD,PUT,PATCH,POST,DELETE');
        cb();
      });

      middlewareWrapper()(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('can specify allowed headers as array', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'header1,header2');
        assert.strictEqual(res.getHeader('Vary'), undefined);
        cb();
      });

      middlewareWrapper({ allowedHeaders: ['header1', 'header2'] })(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('can specify allowed headers as string', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'header1,header2');
        assert.strictEqual(res.getHeader('Vary'), undefined);
        cb();
      });

      middlewareWrapper({ allowedHeaders: 'header1,header2' })(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('specifying an empty list or string of allowed headers will result in no response header for allowed headers', function (done) {
      // arrange
      const options: CorsOptions = {
        allowedHeaders: [],
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), undefined);
        assert.strictEqual(res.getHeader('Vary'), undefined);
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('if no allowed headers are specified, defaults to requested allowed headers', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'x-header-1, x-header-2');
        assert.strictEqual(res.getHeader('Vary'), 'Access-Control-Request-Headers');
        cb();
      });

      middlewareWrapper()(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('can specify exposed headers as array', function (done) {
      // arrange
      const options: CorsOptions = {
        exposedHeaders: ['custom-header1', 'custom-header2'],
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Expose-Headers'), 'custom-header1,custom-header2');
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('can specify exposed headers as string', function (done) {
      // arrange
      const options: CorsOptions = {
        exposedHeaders: 'custom-header1,custom-header2',
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Expose-Headers'), 'custom-header1,custom-header2');
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('specifying an empty list or string of exposed headers will result in no response header for exposed headers', function (done) {
      // arrange
      const options: CorsOptions = {
        exposedHeaders: [],
      };
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Expose-Headers'), undefined);
        done();
      };

      // act
      middlewareWrapper(options)(req, res, next);
    });

    it('includes allowCredentials if explicitly enabled', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.getHeader('Access-Control-Allow-Credentials'), 'true');
        cb();
      });

      middlewareWrapper({ allowCredentials: true })(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('does not includes credentials unless explicitly enabled', function (done) {
      // arrange
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Allow-Credentials'), undefined);
        done();
      };

      // act
      middlewareWrapper()(req, res, next);
    });

    it('includes maxAge when specified', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.getHeader('Access-Control-Max-Age'), '456');
        cb();
      });

      middlewareWrapper({ maxAge: 456 })(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('includes maxAge when specified and equals to zero', function (done) {
      const cb = after(1, done);
      const req = fakeRequest('OPTIONS');
      const res = fakeResponse();

      res.on('finish', function () {
        assert.strictEqual(res.getHeader('Access-Control-Max-Age'), '0');
        cb();
      });

      middlewareWrapper({ maxAge: 0 })(req, res, function (err) {
        cb(err || new Error('should not be called'));
      });
    });

    it('does not includes maxAge unless specified', function (done) {
      // arrange
      const req = fakeRequest('GET');
      const res = fakeResponse();
      const next = function () {
        // assert
        assert.strictEqual(res.getHeader('Access-Control-Max-Age'), undefined);
        done();
      };

      // act
      middlewareWrapper()(req, res, next);
    });
  });
});
