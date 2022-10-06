import express from 'express';
import supertest from 'supertest';

import { middlewareWrapper } from '../src';

process.env.NODE_ENV = 'test';

const simpleApp = express();
simpleApp.head('/', middlewareWrapper(), function (req, res) {
  res.status(204).send();
});

simpleApp.get('/', middlewareWrapper(), function (req, res) {
  res.send('Hello World (Get)');
});

simpleApp.post('/', middlewareWrapper(), function (req, res) {
  res.send('Hello World (Post)');
});

const complexApp = express();
complexApp.options('/', middlewareWrapper());
complexApp.delete('/', middlewareWrapper(), function (req, res) {
  res.send('Hello World (Delete)');
});

describe('example app(s)', function () {
  describe('simple methods', function () {
    it('GET works', function (done) {
      supertest(simpleApp)
        .get('/')
        .set('Origin', '*')
        .expect(200)
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Hello World (Get)')
        .end(done);
    });
    it('HEAD works', function (done) {
      supertest(simpleApp)
        .head('/')
        .set('Origin', '*')
        .expect(204)
        .expect('Access-Control-Allow-Origin', '*')
        .end(done);
    });
    it('POST works', function (done) {
      supertest(simpleApp)
        .post('/')
        .set('Origin', '*')
        .expect(200)
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Hello World (Post)')
        .end(done);
    });
  });

  describe('complex methods', function () {
    it('OPTIONS works', function (done) {
      supertest(complexApp)
        .options('/')
        .set('Origin', '*')
        .expect(204)
        .expect('Access-Control-Allow-Origin', '*')
        .end(done);
    });
    it('DELETE works', function (done) {
      supertest(complexApp)
        .del('/')
        .set('Origin', '*')
        .expect(200)
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Hello World (Delete)')
        .end(done);
    });
  });
});
