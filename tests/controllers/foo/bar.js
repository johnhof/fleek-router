'use strict';

module.exports.post = (ctx, next) => {
  ctx.called = 'foo.bar.get'
  return next(ctx);
};
module.exports.Get = () => {};
module.exports.PuT = () => {};
module.exports.delete = () => {};
module.exports.searchFooBar = () => {};
