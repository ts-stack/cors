import express from 'express';
import supertest from 'supertest';

import { CorsOptions, middlewareWrapper } from '../src';

process.env.NODE_ENV = 'test';

const app = express();
const corsOptions: CorsOptions = {
  origin: true,
  methods: ['POST'],
  credentials: true,
  maxAge: 3600,
};
app.options('/api/login', middlewareWrapper(corsOptions));
app.post('/api/login', middlewareWrapper(corsOptions), function (req, res) {
  res.send('LOGIN');
});

describe('issue  #2', function () {
  it('OPTIONS works', function (done) {
    supertest(app)
      .options('/api/login')
      .set('Origin', 'http://example.com')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://example.com')
      .end(done);
  });
  it('POST works', function (done) {
    supertest(app)
      .post('/api/login')
      .set('Origin', 'http://example.com')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'http://example.com')
      .expect('LOGIN')
      .end(done);
  });
});
