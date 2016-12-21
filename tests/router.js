'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const Router = require('../lib/router');
const SWAGGER = require('./swagger.json');
const CTX = require('./ctx');

describe('Router', () => {
  describe('Constructor', () => {
    it('should initialize', () => {
      let router = new Router();
      expect(router).instanceof(Router);
      expect(router._opts).to.be.an('object');
      expect(router._ctrlMap).to.be.an('object')
      expect(router._ctrlMap.__GLOBAL__).to.be.an('object')
    });
  });

  describe('Controller', () => {
    it('should Return a middleware function', () => {
      let router = new Router();
      expect(router).instanceof(Router);
    });
  });

  describe('Operation', () => {
    it('should return middleare which executes the function when the operationId match\'s', (done) => {
      let router = new Router();
      let exec = false;
      let middleware = router.operation('getFoo', (ctx, next) => { exec = true; return next(); });
      let ctx = CTX.get('/foo/me').context(SWAGGER.paths['/foo/{id}'].get);
      middleware(ctx, () => { expect(exec).to.be.true; done(); });
    });
  });

  describe('Tag', () => {
    it('should return middleare which executes the function when the tag is present', (done) => {
      let router = new Router();
      let exec = false;
      let middleware = router.tag('authenticated', (ctx, next) => { exec = true; return next(); });
      let ctx = CTX.get('/foo/me').context(SWAGGER.paths['/foo/{id}'].get)
      middleware(ctx, () => { expect(exec).to.be.true; done(); });
    });
  });
});
