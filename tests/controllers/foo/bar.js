'use strict';

module.exports.post = (ctx, next) => {
  ctx.called = 'foo.bar.post'
  return next(ctx);
};
module.exports.Get = (ctx, next) => {
  ctx.called = 'foo.bar.get'
  return next(ctx);
};
module.exports.PuT = (ctx, next) => {
  ctx.called = 'foo.bar.put'
  return next(ctx);
};
module.exports.delete = (ctx, next) => {
  ctx.called = 'foo.bar.delete'
  return next(ctx);
};
module.exports.searchFooBar = (ctx, next) => {
  ctx.called = 'searchFooBar'
  return next(ctx);
};
