'use strict';

module.exports.create = (ctx, next) => {
  ctx.called = 'foo.biz.post'
  return next(ctx);
};
module.exports.read = (ctx, next) => {
  ctx.called = 'foo.biz.get'
  return next(ctx);
};
module.exports.update = (ctx, next) => {
  ctx.called = 'foo.biz.put'
  return next(ctx);
};
module.exports.destroy = (ctx, next) => {
  ctx.called = 'foo.biz.delete'
  return next(ctx);
};
module.exports.searchFooBiz = (ctx, next) => {
  ctx.called = 'searchFooBiz'
  return next(ctx);
};