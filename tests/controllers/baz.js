'use strict';

module.exports.get = (ctx, next) => { ctx.called = 'baz.get'; return next(ctx); };
module.exports.createBaz = () => {};
