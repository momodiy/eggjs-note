const EggApplication = require('./lib/egg');
const http = require('http');

// 初始化Egg.js应用
/*
* 使用new方法创建一个对象时，如果此类使用extends方法继承了父类的信息
* 在创建父类对象时也会把括号中的参数传到父类的constructor构造器中作为参数
* */
const app = new EggApplication({
    baseDir: __dirname,
    type: 'application',
});

const server = http.createServer(app.callback());

//server连接错误
server.once('error', err => {
    console.log('[app_worker] server got error: %s, code: %s', err.message, err.code);
    process.exit(1);
});

//端口监听
server.listen(7001, () => {
    console.log('server started at 7001');
});