'use strict';

/*
 * To match implementatio it tests.
 * Don't forget to return promise from test.
 * Don't mix done callback with promise.
 */

const
    proxyquire = require('proxyquire').noCallThru(),
    q = require('q');

describe('avatar: mocha-style', () => {
    let sut,
        UserService,
        ErrorService;

    let userNameDeferred;

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
            ErrorService.handleError.returns(q.reject());
        });

        it('should handle error', () => {
            return sut().catch(() => {
                ErrorService.handleError.should.calledWith(getUserNameError);
            });
        });
    });

    context('when get current user success', () => {
        let fakeUserName;

        beforeEach(() => {
            fakeUserName = 'fakeUserName';
            userNameDeferred.resolve(fakeUserName);
            global.fetch = env.stub();
        });

        it('should get user github info', () => {
            return sut().then(() => {
                fetch.should.calledWith(`https://api.github.com/users/${fakeUserName}`);
            });
        });

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

            it('should parse response', () => {
                return sut().then(() => {
                    fakeFetchResponse.json.should.called;
                });
            });

            it('should return user\'s Github avatar', () => {
                return sut().then(result => {
                    result.should.equal('avatar_url');
                });
            });
        });

        context('when get github info fails', () => {
            let fakeFetchError;

            beforeEach(() => {
                fakeFetchError = {};
                global.fetch.returns(q.reject(fakeFetchError));
                ErrorService.handleError.returns(q.reject());
            });

            it('should handle error', () => {
                return sut().catch(() => {
                    ErrorService.handleError.should.calledWith(fakeFetchError);
                });
            });
        });
    });
});
