'use strict';

const FS = require('fs');

const checkpoint = require('./helpers/checkpoint');


class Router {
  constructor (opts={}) {
    this._opts = opts;
    this._ctrlMap = {
      __GLOBAL__: {}
    };
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

  controller (tag, ctrl) {
    checkpoint(typeof tag === 'string', 'Controller name must be a string')
      .and(typeof ctrl === 'object', 'Operation  be a function');

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

  operation (id, middleware) {
    checkpoint(typeof id === 'string', 'OperationId must be a string')
      .and(typeof middleware === 'function', 'Operation middleware must be a function');

    return (ctx, next) => {
      let ctxId = this._ctxOnFleek(ctx) && ctx.fleek.context.operationId;
      if (ctxId === id) return middleware(ctx, next);
      return next();
    };
  }

  tag (tag, middleware) {
    checkpoint(typeof tag === 'string', 'Tag name must be a string')
      .and(typeof middleware === 'function', 'Tag middleware must be a function');

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

  _getOpCtrl(fleekCtx={}) {
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
