const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const is = require('is-type-of');

/*
* Symbol.for
* 接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值。
* 如果有，就返回这个 Symbol 值，否则就新建并返回一个以该字符串为名称的 Symbol 值。
* */

const ROUTER = Symbol('EggCore#router');
const EGG_LOADER = Symbol.for('egg#loader');

// EggLoader start
class EggLoader {
    constructor(options) {
        console.log(1111);
        console.log(options);
        this.options = options;
        this.app = this.options.app;
    }

    //fs.existsSync 判断文件是否存在
    //inject用于接收待加载的路由
    loadFile(filepath, ...inject) {
        if (!fs.existsSync(filepath)) {
            return null;
        }
        //path.extname(PATH) 返回路径扩展名
        const extname = path.extname(filepath);
        console.log(extname);
        if (!['.js', '.node', '.json', ''].includes(extname)) {
            return fs.readFileSync(filepath);
        }
        const ret = require(filepath);
        if (inject.length === 0) inject = [this.app];
        return is.function(ret) ? ret(...inject) : ret;
    }
}

const LoaderMixinRouter = {
    loadRouter() {
        //使用path模块访问当前路径，与实际路由系统入口文件路径进行拼接，最终将该路劲加入到eggLoader实体启动对象中
        console.log(path.join(this.options.baseDir, 'app/router.js'));
        this.loadFile(path.join(this.options.baseDir, 'app/router.js'));
    }
};

const loaders = [
    LoaderMixinRouter,
];

for (const loader of loaders) {
    Object.assign(EggLoader.prototype, loader);
}
// EggLoader end

// EggCore start
class EggCore extends Koa {
    constructor(options) {
        // process cwd() 方法返回 Node.js 进程当前工作的目录
        options.baseDir = options.baseDir || process.cwd();
        options.type = options.type || 'application';
        super(options);

        const Loader = this[EGG_LOADER];
        console.log(Loader.toString());
        this.loader = new Loader({
            baseDir: options.baseDir,
            app: this,
        });
        console.log(this);
    }

    //get、set 存值函数和取值函数，拦截该属性的存取行为。
    get router() {
        if (this[ROUTER]) {
            return this[ROUTER];
        }

        const router = this[ROUTER] = new Router({sensitive: true}, this);
        // register router middleware
        this.beforeStart(() => {
            console.log(router.middleware());
            this.use(router.middleware());
        });
        return router;
    }

    beforeStart(fn) {
        process.nextTick(fn)
    }
}

// EggCore end


// EggApplication start
class AppWorkerLoader extends EggLoader {
    loadAll() {
        this.loadRouter();
    }
}

class EggApplication extends EggCore {

    constructor(options) {
        // console.log(new AppWorkerLoader);
        super(options);
        this.on('error', err => {
            console.error(err);
        });
        console.log(EGG_LOADER);
        this.loader.loadAll();
    }

    get [Symbol.for('egg#eggPath')]() {
        return __dirname;
    }

    get [Symbol.for('egg#loader')]() {
        return AppWorkerLoader;
    }
}

// EggApplication end


// Router start
class Router extends KoaRouter {
    constructor(opts, app) {
        console.log(opts);
        super(opts);
        this.app = app;
    }
}

// Router end
module.exports = EggApplication;