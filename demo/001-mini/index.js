const EggApplication = require('./lib/egg');
const http = require('http');

// 初始化Egg.js应用
const app = new EggApplication({
    baseDir: __dirname,
    type: 'application',
});

const server = http.createServer(app.callback());

//server连接错误
server.once('error', err => {
    console.log('-----------------------------------------------------');
    console.log(err);
    console.log('-----------------------------------------------------');
    console.log('[app_worker] server got error: %s, code: %s', err.message, err.code);
    process.exit(1);
});

//端口监听
server.listen(7001, () => {
    console.log('server started at 7001');
});