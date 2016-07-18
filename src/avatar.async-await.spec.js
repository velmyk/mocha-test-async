'use strict';

const
    proxyquire = require('proxyquire').noCallThru(),
    q = require('q');

describe('avatar', () => {
    let sut,
        UserService,
        ErrorService;

    let userNameDeferred,
        successCb,
        failCb;

    beforeEach(() => {

        userNameDeferred = q.defer();

        UserService = {
            getCurrentUserName: env.stub().returns(userNameDeferred.promise)
        };

        ErrorService = {
            handleError: env.stub()
        };

        const avatar = proxyquire('./avatar', {
            './UserService': UserService,
            './ErrorService': ErrorService
        });

        sut = avatar.default;

        failCb = env.stub();
        successCb = env.stub();
        
    });

    it('should call for current user name', () => {
        sut();
        UserService.getCurrentUserName.should.called;
    });

    context('when get current user fails', () => {
        let getUserNameError;

        beforeEach(() => {
            getUserNameError = {};
            userNameDeferred.reject(getUserNameError);
        });

        it('should handle error', mochaAsync(async () => {
            await sut();
            ErrorService.handleError.should.calledWith(getUserNameError);
        }));
    });

    context('when get current user success', () => {
        let fakeUserName;

        beforeEach(() => {
            fakeUserName = 'fakeUserName';
            userNameDeferred.resolve(fakeUserName);
            global.fetch = env.stub();
        });

        it('should get user github info', mochaAsync(async () => {
            await sut();
            fetch.should.calledWith(`https://api.github.com/users/${fakeUserName}`);
        }));

        context('when get github info success', () => {
            let fakeFetchResponse,
                fakeGithubInfo;

            beforeEach(() => {
                fakeGithubInfo = {
                    avatar_url: 'avatar_url'
                };
                fakeFetchResponse = {
                    json: env.stub().returns(fakeGithubInfo)
                };
                global.fetch.returns(q.when(fakeFetchResponse));
            });

            it('should parse response', mochaAsync(async () => {
                await sut();
                fakeFetchResponse.json.should.called;
            }));

            it('should return user\'s Github avatar', mochaAsync(async () => {
                const result = await sut();
                result.should.equal('avatar_url');
            }));
        });

        context('when get github info fails', () => {
            let fakeFetchError;

            beforeEach(() => {
                fakeFetchError = {};
                global.fetch.returns(q.reject(fakeFetchError));
            });

            it('should return user\'s Github avatar', mochaAsync(async () => {
                await sut();
                ErrorService.handleError.should.calledWith(fakeFetchError);
            }));
        });
    });
});
