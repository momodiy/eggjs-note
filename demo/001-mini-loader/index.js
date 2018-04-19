'use strict';

const Egg = require('./lib/egg');

const app = new Egg({
  baseDir: __dirname,
  type: 'application',
});
console.log(9001);
console.log(app.callback());
console.log(app.callback().toString());

/*
* http.createServer
* 返回一个新建的http.Server实例（创建一个http服务器）
*
* */

const server = require('http').createServer(app.callback());

server.once('error', err => {
  console.log('[app_worker] server got error: %s, code: %s', err.message, err.code);
  process.exit(1);
});

server.listen(7001, () => {
  console.log('server started at 7001');
});
