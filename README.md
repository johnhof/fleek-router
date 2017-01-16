# Fleek Router

[![Build Status](https://travis-ci.org/fleekjs/fleek-router.svg?branch=master)](https://travis-ci.org/fleekjs/fleek-router)

Middleware for routing to controllers using [swagger](http://swagger.io/specification/) schema's.

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

ctx.use(router.tag('authenticated', (ctx, next) => {
  if (someAuthFunction(ctx)) {
    ctx.body = 'Not authorized';
    ctx.status = 401;
    return Promise.resolve();
  } else return next();
}))

app.use(router.controllers({
  controller: {
    bar: {
      get: (ctx, next) => { /* routes for tags ['bar', ...] and method GET */ },
    },
    foo: {
      biz: {
        post: (ctx, next) => { /* routes for tags ['foo', 'biz' ...] and method POST */ }
      }
    }
  },
  operation: {
    createBar: (ctx, next) => { /* routes for operationId 'createBar' */ }
  }
}));

// OR

app.use(router.controllers(`${__driname}/controllers`));
// TO MATCH EXAMPLE ABOVE:
// controllers/
//  ├── bar.js [exports: get(ctx, next)]
//  ├── foo
//  |    └── biz.js [exports: post(ctx, next)]
//  └── */** [exports: createBar(ctx, next)]

app.listen(3000);
```

# Documentation

## new Router()

- Accepts
  - Object - options
- Returns
  - Router - returns a promise when called

### Example

```javascript
let myRouter = new fleekRouter.Router();

```

## Router.tag(name, operation)

- Accepts
  - String - name of the tag to operate against. if the tag name is present in the request `ctx.fleek.context.tags[]`, the operation will be executed
- Returns
  - Function - returns a promise when called
    - Accepts
      - Object - `ctx`(context) of the request
      - Function - `next` returns promise when called

### Example

```javascript
app.use(router.tag('authenticated', (ctx, next) => {
  console.log(ctx.fleek.context.tags) // => [ ..., 'authenticated', ... ]
  let isAuthenticated = someAuthFunction(ctx);
  if (isAuthenticated) return next();
  else return Promise.reject(Error('401: not authorized'));
}));

app.use((ctx, next) => {
  ctx.body = 'passed authentication';
  return Promise.resolve();
})
```


## Router.operation(operationId, operation)

- Accepts
  - String - name of the tag to route to. if the tag name is present in the request `ctx.fleek.context.operationId`, the operation will be executed
- Returns
  - Function - returns a promise when called
    - Accepts
      - Object - `ctx`(context) of the request
      - Function - `next` returns promise when called

### Example

```javascript
app.use(router.tag('getUser', (ctx, next) => {
  console.log(ctx.fleek.context.operationId) // => 'getUser'
  ctx.body = DB.get('user', ctx.params.user_id);
  return Promise.resolve();
}));
```


## Router.controllers(options) - Controller Directory

- Accepts
  - One of
    - String - path to controllers directory. Directory will be recursively read to create an object of controllers and operations
    - Object - options or list object of controllers and operations
      - Contains One of
- Returns
  - Function - returns a promise when called
    - Accepts
      - Object - context of the request. must have `ctx.fleek.context` to perform validation
      - Function - returns promise when called
- Functionality
  - The directory tree being parsed must contain flat or sud-directy `.js` files exporting operation functions
  - To execute a operation, the request `ctx.fleek.context` must contain data mapping it to the controller/operation
  - Routing:
    - Controllers:
      - To execute a method(`POST`, `GET`, `PUT`, `DELETE`), the swagger documentation must specify the controller as the first tag(`tags: []`) for the path+method
      - Every sub-directory or file name adds an expected tag to the required `ctx.fleek.context.tags[]` to route to the given operation
        - EG: `controllers/foo/bar.js[get(ctx, next) => { ... }]` will  execute for `ctx.fleek.context = { method: 'get', tags: ['foo', 'bar'] }`
    - Operations:
      - Operations are identified by the name of the exported function(`module.exports[operationId]`), if it does not match a method type (`POST`, `GET`, `PUT`, `DELETE`)
      - To execute an operation, the swagger document must specify the `operationId` in the path+method configuration to match the exported function name
      - Operations are prioritized over controllers when routing
      - Operation ID's are unique accross all controllers and operations, as speficied in the swagger 2.0 standard


### Example

```javascript
// Assuming directory structure:
// controllers/
//  ├── bar.js [exports: get(ctx, next) => { ... }]
//  ├── foo
//  |    └── biz.js [exports: post(ctx, next) => { ... }]
//  └── */** [exports: createBar(ctx, next) => { ... }]

app.use(router.controllers(`${__dirname}/controllers`));

// OR

app.use(router.controllers({ path: `${__dirname}/controllers` }));
```

## Router.controllers(controllers) - Controller Object

- Accepts
  - Object - object of controllers and operations
    - At least one of
      - `controller`: Object - shallow or nested controllers, containg method operations (`post|create`, `get|read`, `put|update`, `delete|destroy`)`
      - `operation`: Object - shallow operations. propery keys expected to map to `operationId`
- Returns
  - Function - returns a promise when called
    - Accepts
      - Object - context of the request. must have `ctx.fleek.context` to perform validation
      - Function - returns promise when called
- Functionality
  - NOTE: the expected parameter object is also the compiled format of the directory system listed above
  - To execute a operation, the request `ctx.fleek.context` must contain data mapping it to the controller/operation
  - Routing:
    - Controllers:
      - To execute a method(`POST`, `GET`, `PUT`, `DELETE`), the swagger documentation must specify the controller as the first tag(`tags: []`) for the path+method
      - Every nested property adds an expected tag to the required `ctx.fleek.context.tags[]` to route to the given operation
        - EG: `controller.foo.bar.get: (ctx, next) => { ... }` will  execute for `ctx.fleek.context = { method: 'get', tags: ['foo', 'bar'] }`
    - Operations:
      - Operations are identified by the name of the exported function(`module.exports[operationId]`), if it does not match a method type (`POST`, `GET`, `PUT`, `DELETE`)
      - To execute an operation, the swagger document must specify the `operationId` in the path+method configuration to match the exported function name
      - Operations are prioritized over controllers when routing
      - Operation ID's are unique accross all controllers and operations, as speficied in the swagger 2.0 standard


### Example

```javascript
app.use(router.controllers({
  controller: {
    bar: get(ctx, next) => { /* ... */ },
    foo: {
      biz: {
        post: (ctx, next) => { /* ... */ }
      }
    }
  },
  operation: {
    createBar: (ctx, next) => { /* ... */ }
  }
}));
```

## Authors

- [John Hofrichter](https://github.com/johnhof)

_Built and maintained with [<img width="15px" src="http://hart.com/wp-content/themes/hart/img/hart_logo.svg">](http://hart.com/) by the [Hart](http://hart.com/) team._
