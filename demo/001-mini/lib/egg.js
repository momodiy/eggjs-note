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
        if (!['.js', '.node', '.json', ''].includes(extname)) {
            return fs.readFileSync(filepath);
        }
        const ret = require(filepath);
        if (inject.length === 0) inject = [this.app];
        return is.function(ret) ? ret(...inject) : ret;
    }
}

//定义最小路由的加载文件
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
    //Object.assign(a,b);  将b对象的属性合并添加到a对象，同名属性覆盖，否则添加
    //一个类prototype上的添加属性，用此类实例化的对象可以直接用`obj.key`的方式获取次属性
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

        //获取AppWorkerLoader类,获取时触发EggApplication的get方法
        const Loader = this[EGG_LOADER];
        this.loader = new Loader({
            baseDir: options.baseDir,
            app: this,
        });
    }

    //get、set 存值函数和取值函数，拦截该属性的存取行为。
    get router() {
        if (this[ROUTER]) {
            return this[ROUTER];
        }

        const router = this[ROUTER] = new Router({sensitive: true}, this);
        // register router middleware
        this.beforeStart(() => {
            this.use(router.middleware());
        });
        return router;
    }

    beforeStart(fn) {
        //前事件轮询队列的任务全部完成，fn就会被依次调用。
        process.nextTick(fn)
    }
}

// EggCore end


// EggApplication start
class AppWorkerLoader extends EggLoader {
    loadAll() {
        //调用EggLoader.prototype上边的loadRouter方法
        this.loadRouter();
    }
}

class EggApplication extends EggCore {
    /*
    * 子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工
    * 子类在调用super方法后,this指的是通过父类对象constructor实例化生成的对象
    * 可以通过修改this改变这个对象的值
    * */
    constructor(options) {
        // console.log(new AppWorkerLoader);
        super(options);

        this.on('error', err => {
            console.error(err);
        });
        this.loader.loadAll();
    }

    /*
    * Class 中的get方法用于自定义取值函数
    * 当该类实例化的对象获取使用get定义的值时会返回自定义的值
    * 当该类实例化的对象使用了set方法对某个值进行定义，在修改这个值时实际保存的值为set中定义的值
    * */
    get [Symbol.for('egg#eggPath')]() {
        return __dirname;
    }

    get [Symbol.for('egg#loader')]() {
        return AppWorkerLoader;
    }
}

// EggApplication end


// Router start 加载路由系统
class Router extends KoaRouter {
    constructor(opts, app) {
        console.log(opts);
        super(opts);
        console.log(this);
        console.log(app);
        this.app = app;
        console.log(this);
    }
}

console.log(new KoaRouter());
// Router end
module.exports = EggApplication;