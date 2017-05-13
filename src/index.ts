// got inspiration from https://github.com/sethyuan/streamline-express/blob/master/lib/streamline-express.js
import { run, eventHandler } from 'f-promise';
import * as express from 'express';

function wrap(val: any): any {
    if (Array.isArray(val)) return val.map(wrap);
    else if (typeof val !== 'function') return val;
    return eventHandler(val);
}

function patch(app: any, method: string) {
    if (app[method]) {
        const original = app[method];
        app[method] = function (this: any, ...args: any[]) {
            return original.apply(this, wrap(args));
        }
    }
};

export = function (): express.Express {
    const app = express();
    var methods = <string[]>require("methods").concat(['all', 'use', 'param']);
    methods.forEach(m => patch(app, m));
    return app;
}
