import express, { Response } from 'express';
import { IncomingMessage } from 'http';
import supertest from 'supertest';

import { AnyFn } from '../src/main';
import { middlewareWrapper } from '../src';

process.env.NODE_ENV = 'test';

const app = express();
app.use(middlewareWrapper());

app.post('/five-hundred', function (req, res, next) {
  next(new Error('nope'));
});

app.post('/four-oh-one', function (req, res, next) {
  next(new Error('401'));
});

app.post('/four-oh-four', function (req, res, next) {
  next();
});

app.use(function (err: Error, req: IncomingMessage, res: Response, next: AnyFn) {
  if (err.message === '401') {
    res.status(401).send('unauthorized');
  } else {
    next(err);
  }
});

describe('error response', function () {
  it('500', function (done) {
    supertest(app)
      .post('/five-hundred')
      .expect(500)
      .expect('Access-Control-Allow-Origin', '*')
      .expect(/Error: nope/)
      .end(done);
  });

  it('401', function (done) {
    supertest(app)
      .post('/four-oh-one')
      .expect(401)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('unauthorized')
      .end(done);
  });

  it('404', function (done) {
    supertest(app).post('/four-oh-four').expect(404).expect('Access-Control-Allow-Origin', '*').end(done);
  });
});
