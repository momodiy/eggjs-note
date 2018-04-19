'use strict';

module.exports = {
    /*
    * async表示函数里有异步操作
    * await表示紧跟在后面的表达式需要等待结果
    * async函数的返回值是 Promise 对象
    * 可直接调用async返回结果的then方法
    */
    
    async index(ctx) {
        ctx.body = 'This is index page!';
    },

    async hello(ctx) {
        ctx.body = 'This is hello page!';
    },
};
