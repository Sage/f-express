import { wait } from 'f-promise';
import express = require('express');
import { Request, Response } from 'express';
import fexpress = require('../src');
import request = require('supertest');

function delay(x: string) {
    wait(cb => setTimeout(cb, 0));
    return x;
}

describe('use', function () {
    it('should work with f-express', function (done) {
        var app = fexpress();
        app.use(function (req, res) {
            res.send(delay("hello"));
        });
        request(app)
            .get('/')
            .expect(200, 'hello', done);
    })
    it('should fail with express', function (done) {
        var app = express();
        app.use(function (req, res) {
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
