'use strict';

class Ctx {
  constructor (method='', path='', opts={}) {
    method = method.toLowerCase();
    this.fleek = {};
    this.request = {};
    this.method(method);
    this.path(path);
    this.params(opts.params);
    this.body(opts.body);
    this.query(opts.query);
    this.context(opts.context);
  }

  method (method='') {
    method = method.toUpperCase();
    this.method = method;
    this.fleek.method = method;
    return this;
  }

  path (path='') {
    this.path = path;
    return this;
  }

  params (opts={}) {
    this.params = opts;
    this.fleek.params = opts;
    return this;
  }

  body (opts={}) {
    this.request.body = opts;
    return this;
  }

  query (opts={}) {
    this.request.query = opts;
    return this;
  }

  context (context={}) {
    this.fleek.context = context;
    return this;
  }
}

module.exports = Ctx;
module.exports.post = (path, opts) => (new Ctx('post', path, opts));
module.exports.get = (path, opts) => (new Ctx('get', path, opts));
module.exports.put = (path, opts) => (new Ctx('put', path, opts));
module.exports.delete = (path, opts) => (new Ctx('delete', path, opts));
