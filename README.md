# Fleek Router

[![Build Status](https://travis-ci.org/fleekjs/fleek-router.svg?branch=master)](https://travis-ci.org/fleekjs/fleek-router)

Middleware and utilities for validating data against [swagger](http://swagger.io/specification/) schema's.

Requirements:
- Node >= 6.0.0
- [fleek-context](https://github.com/fleekjs/fleek-context)

# Usage

This package is to be used as middleware for [Koa2](https://github.com/koajs/koa/tree/v2.x) to route paths definted in swagger documentation using `ctx.fleek.context` defined by [fleek-context](https://github.com/fleekjs/fleek-context) or an equivalent custom middleware.

```
npm install --save fleek-router
```

# Examples

For a swagger example, refer to the test [swagger json](https://github.com/fleekjs/fleek-router/blob/master/tests/swagger.json)

```javascript
const Koa = require('koa');
const fleekCtx = require('fleek-context');
const fleekRouter = require('fleek-router');

const SWAGGER = require('./swagger.json');

let app = new Koa();

app.use(fleekCtx(SWAGGER));

let router = fleekRouter({ controllers: `${__dirname}/controllers` });

router.tag('authenticated', (ctx, next) => {
  if (someAuthFunction(ctx)) {
    ctx.body = 'Not authorized';
    ctx.status = 401;
    return Promise.resolve();
  } else return next();
});

app.use(router);

app.listen(3000);
```

# Documentation

## Authors

- [John Hofrichter](https://github.com/johnhof)

_Built and maintained with [<img width="15px" src="http://hart.com/wp-content/themes/hart/img/hart_logo.svg">](http://hart.com/) by the [Hart](http://hart.com/) team._
