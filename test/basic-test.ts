import { wait, run } from 'f-promise';
import express = require('express');
import { Application, Router, Request, Response, NextFunction } from 'express';
import fexpress = require('../src');
import request = require('supertest');

function delay(x: string) {
    wait(cb => setTimeout(cb, 0));
    return x;
}

describe('app.use', function () {
    it('should work with f-express', function (done) {
        const app = fexpress();
        app.use(function (req: Request, res: Response) {
            res.send(delay("hello"));
        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });

    it('should fail with express', function (done) {
        const app = express();
        app.use(function (req: Request, res: Response) {
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

describe('app.get', function () {
    it('should work with f-express', function (done) {
        const app = fexpress();
        app.get('/', function (req: Request, res: Response) {
            res.send(delay("hello"));
        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });

    it('should fail with express', function (done) {
        const app = express();
        app.get('/', function (req: Request, res: Response) {
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

describe('router.get', function () {
    it('should work with f-express', function (done) {
        const app: Application = fexpress();
        const router: Router = express.Router();
        router.get('/', function (req: Request, res: Response) {
            res.send(delay("hello"));
        });
        app.use(router);
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });

    it('should fail with express', function (done) {
        const app: Application = express();
        const router: Router = express.Router();
        router.get('/', function (req: Request, res: Response) {
            try {
                res.send(delay("hello"));
            } catch (ex) {
                res.status(500).send(ex.message);
            }
        });
        app.use(router);
        request(app)
            .get('/')
            .expect(500, /yield\(\) called with no fiber/, done);
    });
});

describe('simple middleware chain', () => {
    it('should work with f-express', function (done) {
        const app = fexpress();
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            next();
        }, function (req: Request, res: Response) {
            res.send(delay("hello"));
        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });

    it('should fail with express', function (done) {
        const app: Application = express();
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            next();
        }, function (req: Request, res: Response) {
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

    it('should works with express if encapsulate with run', function (done) {
        const app: Application = express();
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            next();
        }, function (req: Request, res: Response) {
            run(() => {
                res.send(delay("hello"));
            }).catch(ex => {
                res.status(500).send(ex.message);
            });
        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });

    it('should works with express if previous handler encapsulate with run', function (done) {
        const app: Application = express();
        app.use(function(req: Request, res: Response, next: NextFunction) {
            run(() => {
                next();
            }).catch(next)
        });
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            next();
        }, function (req: Request, res: Response) {
            res.send(delay("hello"));

        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });

});

describe('middleware chain with one calling next inside a promise resolve', () => {
    it('should work with f-express', function (done) {
        const app = fexpress();
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            Promise.resolve()
                .then(function () {
                    next();
                });
        }, function (req: Request, res: Response) {
            res.send(delay("hello"));
        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    });


    it('should fail with express', function (done) {
        const app: Application = express();
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            Promise.resolve()
                .then(function () {
                    next();
                });
        }, function (req: Request, res: Response) {
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

    it('should fail with express even if previous handler encapsulate with run', function (done) {
        const app: Application = express();
        app.use(function(req: Request, res: Response, next: NextFunction) {
            run(() => {
                next();
            }).catch(next)
        });
        app.get('/', function (req: Request, res: Response, next: NextFunction) {
            Promise.resolve()
                .then(function () {
                    next();
                });
        }, function (req: Request, res: Response) {
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