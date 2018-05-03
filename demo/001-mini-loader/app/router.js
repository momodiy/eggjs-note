'use strict';


module.exports = app => {

    const router = app.router;
    const controller = app.controller;

    console.log('APP ROUTER');
    console.log(app.router);
    console.log('APP CONTROLLER');
    console.log(app.controller);
    router.get('/', controller.page.index);
    router.get('/hello', controller.page.hello);
    router.resources('posts', '/api/posts', controller.api);

};
