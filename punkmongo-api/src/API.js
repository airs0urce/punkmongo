const Koa = require('koa');
const parse = require('co-body');
const cors = require('koa2-cors');
const koaRouter = require('koa-router');
const config = require('./../../config');
const DBFactory = require('./DBFactory');
const fs = require('mz/fs');
const a = require('awaiting');
const ApiError = require('./errors/ApiError');


const app = new Koa();
const router = new koaRouter();

(async () => {  
    const dbClient = await DBFactory.connectMongo();

    /**
    *    JSON API
    */

    const apiMethods = await (async () => {
        const apiMethodsPath = __dirname + '/API/';
        const methodFiles = await fs.readdir(apiMethodsPath);
        const methods = {};
        for (let methodFile of methodFiles) {
            if (! methodFile.includes('.js')) {
                continue;
            }
            const methodName = methodFile.replace('.js', '');
            const methodFunction = require(apiMethodsPath + methodFile);
            methods[methodName] = methodFunction;
        }
        return methods;
    })();
    

    router.post(`/api/:method_name`, async (ctx, next) => {
        try {
            let body;
            try {
                body = await parse.json(ctx, { limit: '3mb' });
            } catch (e) {
                throw new ApiError(e.message, ApiError.ERROR_INPUT);
            }
            
            if (! apiMethods[ctx.params.method_name]) {
                throw new ApiError(`Method "${ctx.params.method_name}" doesn't exist`, 101);
            } else {
                const result = await apiMethods[ctx.params.method_name](body.params, dbClient);
                ctx.body = {
                    id: body.id,
                    success: true,
                    result: result
                };
            }
            
        } catch (e) {
            const response = {
                id: null,
                success: false,
                error: {
                    message: stackTrace(e),
                    code: e.code || 101
                },
            };
            ctx.body = response;
        }

    });

    app.use(cors());
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(config.api.port);
    

    console.log(`Started API on ${config.api.host}:${config.api.port}`);
})();



// const crypto = require('crypto');
// const token = crypto.createHmac('sha256', config.api.auth.password).update(config.api.auth.username).digest('hex')
// console.log('Authorization header:', token)


function stackTrace(e) {
    if (! e.stack) {
        Error.captureStackTrace(e, stackTrace);
    }
    return e.stack;
}



