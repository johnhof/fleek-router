'use strict';

const FS = require('fs');
const PATH = require('path');

const checkpoint = require('./helpers/checkpoint');

class Router {
  constructor (opts={}) {
    this._opts = opts;
    this._ctrlsDir = typeof opts.controllers === 'string' ? opts.controllers : false;
    this._ctrls = typeof opts.controllers === 'object' ? opts.controllers : false;
    this._ctrlMap = {};
    this._opMap = {};
  }

  compile (swagger={}, opts={}) {
    let pathObj = swagger.paths || {};
    let pathStrs = Object.keys(pathObj);
    for (let pathStr of pathStrs) {
      let normPath = pathStr.toLowerCase().trim();
      let methodStrs = Object.keys(pathObj[pathStr] || {});
      for (let methodStr of methodStrs) {
        let normMethod = pathStr.toLowerCase().trim();
        this._ctrlMap[normMethod];
        //
        // TODO: compiling things
        //
      }
    }

    return (ctx, next) => {
      if (!this._ctxOnFleek(ctx)) return next();
      let operation = this._getOpCtrl(ctx.fleek.context);
      if (operation) return operation(ctx, next);
      else return next();
    };
  }

  // Controller returns middleware that only executes if the context contains the specified controller
  controller (tag, ctrl) {
    checkpoint(typeof tag === 'string', 'controller name must be a string')
      .and(typeof ctrl === 'object', 'operation  be a function');

    return (ctx, next) => {
      if (!this._ctxIncludesTag(tag)) return next();
      let operation = ctrl[ctx.fleek.context.operationId];
      if (operation) return operation(ctx, next);
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

  // Path compiles and returns a routing middleware using swager docs and a controller directory
  paths (swagger, controllers, opts={}) {
    let paths = swagger ? (swagger.paths || swagger) : this._paths;
    let ctrlsDir = typeof controllers === 'string' ? controllers : this._ctrlsDir;
    let ctrls = typeof controllers === 'object' ? controllers : this._ctrls;

    checkpoint(typeof paths === 'array', 'swagger must be an array or paths, or have a path array property')
      .and(ctrls || ctrlsDir, 'controllers must be defined either as a path string, or and object of functions')

    return (ctx, next) => {
      if (false) return THAT_FUNCTION_TO_CALL(ctx, next);
      else return next();
    }
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
            let addMethod = (_method, _namespace, _op) => {
              map.controller[_namespace] = map.controller[_namespace] || {};
              map.controller[_namespace][_method] = content[_op];
            }
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

  _getOpCtrl (fleekCtx={}) {
    let result = false;
    let opId = fleekCtx.operationId;
    let ctrl = fleekCtx.controller || (fleekCtx.tags || [])[0];
    let method = ctx.method.toLowerCase().trim();
    let map = this._ctrlMap;
    let mapGlobals = map.__GLOBAL__;

    // Operation ID specific to a controller
    if (map[ctrl] && map[ctrl][opId]) return map[ctrl][opId](ctx, next);

    // Non-specific operationId
    else if (mapGlobals[opId]) return mapGlobals[opId]

    // Controller with matching method
    else if (map[ctrl] && map[ctrl][method]) return method;

    // No matching operation
    else return false;
  }

  _parseCtrlTree (pathRoot) {
    let rootContents = FS.readDirSync(pathRoot);
  }

  _reqOpKey (method, path) {
    return method && path ? `${method.toLowerCase().trim()}::${path}` : false;
  }
}

module.exports = Router;
