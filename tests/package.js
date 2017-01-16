'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;

const Router = require('../lib/router');
const router = require('../');

describe('Package Exports', () => {
  describe('Root', () => {
    it('should be an instance of Router', () => {
      expect(router).instanceof(Router);
    });
  });
  describe('Constructor', () => {
    it('should allow creation of additional routers', () => {
      expect((new router.Router())).instanceof(Router);
    });
  });
});
