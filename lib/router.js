'use strict';

const FS = require('fs');
const PATH = require('path');

const checkpoint = require('./helpers/checkpoint');
const toss = require('./helpers/toss')

class Router {
  constructor (opts={}) {
    this._opts = opts;
  }

  controllers (opts) {
    let map = { controller : {}, operation: {} };
    checkpoint(opts, 'controller middleware requires param [opts] to be the path to the controllers '
    + 'directory, an object of controllers, or [opts.path] or [opts.controllers]');

    // Construct the contrustor map from a directory
    if (typeof opts === 'string' && PATH.parse(opts)) map = this._ctrlDirToMap(opts);
    else if (opts.path && PATH.parse(opts.path)) map = this._ctrlDirToMap(opts.path);

    // Look for the controllers as part of the options
    else if (opts && (opts.controller || opts.operation)) {
      map.controller = opts.controller || {};
      map.operation = opts.operation || {};
    }


    return (ctx, next) => {
      if (!this._ctxOnFleek(ctx)) return next();
      let context = ctx.fleek.context;

      // operation ID request takes priority
      if (map.operation[context.operationId]) {
        return map.operation[context.operationId](ctx, next);

      // controller or bypass
      } else {
        // use tags to dig into controller map
        let node = map.controller;
        let method = ctx.method.toLowerCase();
        for (let tag of (context.tags || [])) {
          // if the node doesnt have a child matching the next tag, exit
          if (!node[tag]) break;
          //otherwise, continue
          else node = node[tag];
        }

        // if the tags have been depleted, and hte resulting node is a function, execute
        if (node && typeof node[method] === 'function')  {
          return node[method](ctx, next);
        } else return next();
      }
    };
  }

  // Controller returns middleware that only executes if the context contains the specified controller
  controller (tag, ctrl) {
    checkpoint(typeof tag === 'string', 'controller name must be a string')
      .and(typeof ctrl === 'object', 'operation  be a function');

    return (ctx, next) => {
      if (!this._ctxIncludesTag(tag)) return next();

      // operationId takes priority
      let operation = ctrl[ctx.fleek.context.operationId];
      if (operation) return operation(ctx, next);

      // fall back to controller + method
      method = ctx.method.trim().toLowerCase();
      let opNames = Object.keys(ctrl);
      for (let opName of opNames) if (opName.trim().toLowerCase() === method) return ctrl[opName](ctx, next);
      return next();
    };
  }

  // Tag returns middleware that only executes if the context contains the specified operationId
  operation (id, middleware) {
    checkpoint(typeof id === 'string', 'operationId must be a string')
      .and(typeof middleware === 'function', 'operation middleware must be a function');

    return (ctx, next) => {
      let ctxId = this._ctxOnFleek(ctx) && ctx.fleek.context.operationId;
      if (ctxId === id) return middleware(ctx, next);
      return next();
    };
  }

  // Tag returns middleware that only executes if the context contains the specified tag
  tag (tag, middleware) {
    checkpoint(typeof tag === 'string', 'tag name must be a string')
      .and(typeof middleware === 'function', 'tag middleware must be a function');

    return (ctx, next) => {
      if (this._ctxIncludesTag(tag, ctx)) return middleware(ctx, next);
      else return next();
    };
  }

  //
  // Helpers
  //

  _ctxOnFleek (ctx) {
    return (ctx.fleek && ctx.fleek.context);
  }

  _ctxIncludesTag(tag, ctx) {
    if (!this._ctxOnFleek(ctx)) return false;
    let ctxTags = ctx.fleek.context.tags || []
    for (let ctxTag of ctxTags) if (ctxTag === tag) return true;
    return false;
  }

  _ctrlDirToMap (path) {
    path = PATH.resolve(path);
    let map = {
      controller: {},
      operation: {}
    };
    checkpoint(typeof path === 'string', 'path must be a string');
    let q = FS.readdirSync(path);
    for (let i in q) q[i] = {
      basePath: path,
      fullPath: PATH.join(path, q[i]),
      name: q[i],
      namespace: q[i]
    };

    let setCtrlOp = (namespace, operation) => {
      namespace = namespace.split('.');
      let node = map.controller;
      let limit = namespace.length-1;
      for (let i in namespace) {
        let name = namespace[i];
        if (!node[name]) node[name] = {};
        if (i == limit) node[name] = operation;
        else node = node[name];
      }
    }

    while (q.length) {
      let node = q.shift()

      // directory
      if (node.name.indexOf('.') <= 0) {
        let contents = FS.readdirSync(node.fullPath);
        for (let name of contents) q.push({
          basePath: node.fullPath,
          fullPath: PATH.join(node.fullPath, name),
          name: name,
          namespace: `${node.namespace}.${name}`
        });

      // js file
      } else if (node.name.indexOf('.') > 0) {
        let content = require(node.fullPath);
        let contentType = typeof content
        node.name = node.name.replace(/\.js$/, '');
        node.namespace = node.namespace.replace(/\.js$/, '');

        // handler
        if (contentType === 'function') {
          map.controller[node.namespace] = content;

        // object of handlers
        } else if (contentType === 'object') {
          // compile operation maps
          let operations = Object.keys(content);
          for (let op of operations) {
            let addMethod = (_method, _namespace, _op) => setCtrlOp(`${_namespace}.${_method}`, content[op]);
            if (/^(create|post)$/i.test(op)) addMethod('post', node.namespace, op);
            else if (/^(update|put)$/i.test(op)) addMethod('put', node.namespace, op);
            else if (/^(read|get)$/i.test(op)) addMethod('get', node.namespace, op);
            else if (/^(destroy|delete)$/i.test(op)) addMethod('delete', node.namespace, op);
            else map.operation[op] = content[op];
          }
        }
      }
    }

    return map;
  }
}

module.exports = Router;
