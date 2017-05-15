// got inspiration from https://github.com/sethyuan/streamline-express/blob/master/lib/streamline-express.js
import { eventHandler } from 'f-promise';
import * as express from 'express';

function wrap(val: any): any {
    if (Array.isArray(val)) return val.map(wrap);
    else if (typeof val !== 'function') return val;
    return eventHandler(val);
}

function patch(app: any, method: string) {
    if (app[method]) {
        const original = app[method];
        app[method] = function (this: any) {
            let args: any[] = [];
            for (let i = 0; i < arguments.length; i++) {
                args[i] = arguments[i];
            }
            return original.apply(this, wrap(args));
        }
    }
}

export = function (): express.Express {
    const app = express();
    const methods = <string[]>require("methods").concat(['all', 'use', 'param']);
    methods.forEach(m => patch(app, m));
    return app;
}
