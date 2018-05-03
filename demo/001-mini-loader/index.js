'use strict';

const Egg = require('./lib/egg');

const app = new Egg({
  baseDir: __dirname,
  type: 'application',
});

/*
* http.createServer()
* 返回一个新建的http.Server实例（创建一个http服务器）
* 括号内是一个监听返回结果的函数，可以拿到发送的请求以及请求的返回结果
* */
console.log(222);
console.log(app.callback().toString());
const server = require('http').createServer(app.callback());

server.once('error', err => {
  console.log('[app_worker] server got error: %s, code: %s', err.message, err.code);
  process.exit(1);
});

server.listen(7001, () => {
  console.log('server started at 7001');
});
