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
            const args = Array.prototype.slice.call(arguments);
            return original.apply(this, wrap(args));
        }
    }
}

function e(): express.Express {
    const app = express();
    const methods = <string[]>require("methods").concat(['all', 'use', 'param']);
    methods.forEach(m => patch(app, m));
    return app;
}

namespace e {
    export const express = e;
    export interface RouterOptions extends express.RouterOptions { }
    export interface Application extends express.Application { }
    export interface CookieOptions extends express.CookieOptions { }
    export interface Errback extends express.Errback { }
    export interface ErrorRequestHandler extends express.ErrorRequestHandler { }
    export interface Express extends express.Express { }
    export interface Handler extends express.Handler { }
    export interface IRoute extends express.IRoute { }
    export interface IRouter<T> extends express.IRouter<T> { }
    export interface IRouterHandler<T> extends express.IRouterHandler<T> { }
    export interface IRouterMatcher<T> extends express.IRouterMatcher<T> { }
    export interface MediaType extends express.MediaType { }
    export interface NextFunction extends express.NextFunction { }
    export interface Request extends express.Request { }
    export interface RequestHandler extends express.RequestHandler { }
    export interface RequestParamHandler extends express.RequestParamHandler { }
    export interface Response extends express.Response { }
    export interface Router extends express.Router { }
    export interface Send extends express.Send { }
}

export = e;