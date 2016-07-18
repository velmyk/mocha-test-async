'use strict';

const proxyquire = require('proxyquire').noCallThru();

describe('avatar', () => {
    let sut,
        UserService,
        ErrorService;

    let fakeUserName,
        fakeGithubInfo,
        successCb,
        failCb;

    beforeEach(() => {

        UserService = {
            getCurrentUserName: env.stub().returns(Promise.resolve())
        };

        ErrorService = {
            handleError: env.stub()
        };

        const avatar = proxyquire('./avatar', {
            './UserService': UserService,
            './ErrorService': ErrorService
        });

        sut = avatar.default;

        global.fetch = env.stub().resolves();

        failCb = env.stub();
        successCb = env.stub();
        
    });

    it('should call for current user name', () => {
        sut();
        UserService.getCurrentUserName.should.called;
    });
});
