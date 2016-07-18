'use strict';

const
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    sinonAsPromised = require('sinon-as-promised'),
    q = require('q');

global.env = null;
global.sinon = sinon;
sinonAsPromised(q.Promise);
chai.should();

chai.use(sinonChai);

beforeEach(() => {
    global.env = sinon.sandbox.create();
});

afterEach(() => {
    global.env.restore();
});