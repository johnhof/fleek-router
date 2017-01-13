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
    });
  });

  describe('Controller', () => {
    it('should take a tag and controller obejct and return a middleware function', () => {
      let router = new Router();
      expect(router).instanceof(Router);
    });
  });

  describe('Controllers', () => {
    it('should take a controllers object and return a middleware function', () => {
      let router = new Router();
      expect(router).instanceof(Router);
      router.controllers({});

      //
      // TODO: test
      //

    });
    it('should take a controllers directory and return a middleware function', (done) => {
      let router = new Router();
      expect(router).instanceof(Router);
      let ctrlDir = `${__dirname}/controllers`;
      let count = 0;
      let doneCondition = () => { count++; if (count == 2) done(); };
      router.controllers(ctrlDir)({}, doneCondition);
      router.controllers({ path: ctrlDir })({}, doneCondition);
    });
    it('should reject invalid parameters', (done) => {
      let router = new Router();
      expect(() => router.controllers()).to.throw('requires');
      expect(() => router.controllers('asdf')).to.throw('ENOENT');
      expect(() => router.controllers({ path: 'asdf' })).to.throw('ENOENT');
    });
    describe('Controllers Middleware', () => {
      it('should route to flat controller methods', (done) => {
        let router = new Router();
        expect(router).instanceof(Router);
        let ctrlDir = `${__dirname}/controllers`;
        router.controllers(ctrlDir)(CTX.get('/baz').context(SWAGGER.paths['/baz/list'].get), (ctx) => {
          if (ctx.called('baz.get')) done();
          else done('Failed to route');
        });
      });
      it('should route to nested controller methods specified by tag', () => {

        //
        // TODO: test
        //

      });
      it('should route to nested controller methods by tag ignoring unrecognized tags', () => {

        //
        // TODO: test
        //

      });
      it('should route to by operationId', () => {

        //
        // TODO: test
        //

      });
      it('should prioritize operationId over controller namespace', () => {

        //
        // TODO: test
        //

      });
      it('should forward unrecognized routes', () => {

        //
        // TODO: test
        //

      });
    });
  });

  describe('Operation', () => {
    it('should return middleware which executes the function when the operationId match\'s', (done) => {
      let router = new Router();
      let exec = false;
      let middleware = router.operation('getFoo', (ctx, next) => { exec = true; return next(); });
      let ctx = CTX.get('/foo/me').context(SWAGGER.paths['/foo/{id}'].get);
      middleware(ctx, () => { expect(exec).to.be.true; done(); });
    });
    it('should return middleware which bypasses the function when the operationId does not match\'s', (done) => {
      let router = new Router();
      let exec = false;
      let middleware = router.operation('getFoo', (ctx, next) => { exec = true; return next(); });
      let ctx = CTX.get('/foo/me').context(SWAGGER.paths['/foo/{id}'].update);
      middleware(ctx, () => { expect(exec).to.be.false; done(); });
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
    it('should return middleare which bypasses the function when the tag is not present', (done) => {
      let router = new Router();
      let exec = false;
      let middleware = router.tag('authenticated', (ctx, next) => { console.log('wtf'); exec = true; return next(); });
      let ctx = CTX.get('/foo/me').context(SWAGGER.paths['/foo/{id}'].update)
      middleware(ctx, () => { expect(exec).to.be.false; done(); });
    });
  });

  describe('Helpers', () => {
    describe('_ctrlDirToMap', () => {
      it('should take a directory path and return maps of controller and operation', () => {
        let router = new Router();
        let map = router._ctrlDirToMap(`${__dirname}/controllers`);
        expect(map).to.be.an('object');
        expect(map.controller).to.be.an('object');

        expect(map.controller.foo.bar).to.be.an('object');
        expect(map.controller.foo.bar.post).to.be.a('function');
        expect(map.controller.foo.bar.get).to.be.a('function');
        expect(map.controller.foo.bar.put).to.be.a('function');
        expect(map.controller.foo.bar.delete).to.be.a('function');
        expect(map.controller.foo.biz).to.be.an('object');
        expect(map.controller.foo.biz.post).to.be.a('function');
        expect(map.controller.foo.biz.get).to.be.a('function');
        expect(map.controller.foo.biz.put).to.be.a('function');
        expect(map.controller.foo.biz.delete).to.be.a('function');
        expect(map.controller.baz).to.be.an('object');
        expect(map.controller.baz.get).to.be.a('function');

        expect(map.operation).to.be.an('object');
        expect(map.operation.searchFooBar).to.be.a('function');
        expect(map.operation.searchFooBiz).to.be.a('function');
        expect(map.operation.createBaz).to.be.a('function');
      });
    });
  });
});
