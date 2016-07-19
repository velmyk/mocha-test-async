'use strict';

/*
 * Don't forget to return promise from test.
 */

const
    proxyquire = require('proxyquire').noCallThru();

describe('avatar: chai-as-promised', () => {
    let sut,
        UserService,
        ErrorService;

    beforeEach(() => {

        UserService = {
            getCurrentUserName: env.stub().resolves()
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
            ErrorService.handleError.rejects(getUserNameError);
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
            UserService.getCurrentUserName.resolves(fakeUserName);
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
                global.fetch.resolves(fakeFetchResponse);
            });

            it('should parse response', () => {
                return sut().then(() => {
                    fakeFetchResponse.json.should.called;
                });
            });

            it('should return user\'s Github avatar', () => {
                return sut().should.eventually.equal('avatar_url');
            });
        });

        context('when get github info fails', () => {
            let fakeFetchError;

            beforeEach(() => {
                fakeFetchError = {};
                global.fetch.rejects(fakeFetchError);
                ErrorService.handleError.rejects();
            });

            it('should handle error', () => {
                return sut().catch(() => {
                    ErrorService.handleError.should.calledWith(fakeFetchError);
                });
            });
        });
    });
});
