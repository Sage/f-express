import { wait, run } from 'f-promise';
import express = require('express');
import { Express, IRouterHandler, Application, Router, Request, Response, NextFunction } from '../src';
import fexpress = require('../src');
import request = require('supertest');

function delay(x: string) {
	wait(cb => setTimeout(cb, 0));
	return x;
}

function test(name: string, fn: (app: Express) => (body: express.RequestHandler) => any) {
	describe(name, function () {
		it('should work with f-express', function (done) {
			const app = fexpress();
			fn(app)((req, res) => {
				res.send(delay("hello"));
			});
			request(app)
				.get('/')
				.expect(200, 'hello', done);
		});

		it('should fail with express', function (done) {
			const app = express();
			fn(app)((req, res) => {
				try {
					res.send(delay("hello"));
				} catch (ex) {
					res.status(500).send(ex.message);
				}
			});
			request(app)
				.get('/')
				.expect(500, /yield\(\) called with no fiber/, done);
		});
	});
}

test('app.use', app => app.use.bind(app));
test('app.get', app => (handler: express.RequestHandler) => app.get('/', handler));

test('router.get', app => {
	const router: Router = express.Router();
	app.use(router);
	return (handler: express.RequestHandler) => router.get('/', handler);
});

test('simple middleware chain', app => {
	return (handler: express.RequestHandler) => {
		app.get('/', (req, res, next) => next(), handler);
	}
});

test('middleware chain with one calling next inside a promise resolve', app => {
	return (handler: express.RequestHandler) => {
		app.get('/', function (req, res, next) {
			Promise.resolve().then(next);
		}, handler);
	}
});

describe('error handler middleware', () => {
	it('should work with f-express', function (done) {
		const app: Application = fexpress();

		app.get('/', function (req, res, next) {
			next(new Error("testing"));
		});

		app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
			res.status(500).send(`ERR: ${err.message}`);
		});

		request(app)
			.get('/')
			.expect(500, 'ERR: testing', done);
	});
});