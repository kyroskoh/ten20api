var should = require('should');
var server = require('../server');
var requestApi = require('request');
var request = requestApi.defaults({followRedirect: false, jar: requestApi.jar()});

var assert = require('assert');

var port = 3001;

var dbName = 'testUsers' + new Date().toUTCString().replace(/\s+/g,'');

describe('user routes', function () {
    var url = 'http://localhost:' + port;

    var credential = {
        email: 'test@ten20.com',
        password: 'test'
    };

    var invalidCredential = {
        email: 'test@ten20.com',
        password: 'test2'
    };

    before(function (done) {
        server.startServer(port, dbName, done);
    });

    after(function (done) {
        server.close(done);
    });

    it('should not be possible to access info endpoint', function (done) {

        request.get(url + '/user/info', function (error, response, body) {
            assert.ifError(error);
            assert.equal(403, response.statusCode);
            done();
        });

    });

    it('should create an account', function (done) {
        request.post({url: url + '/signup', json: credential}, function (error, response, body) {
            assert.ifError(error);
            assert.equal(200, response.statusCode);
            done();
        });
    });

    it('should still not be possible to access info endpoint after create account', function (done) {
        request.get(url + '/user/info', function (error, response, body) {
            assert.ifError(error);
            console.log(response.body);
            assert.equal(403, response.statusCode);
            done();
        });

    });

   it('should fail to create account an second time', function (done) {
        request.post({url: url + '/signup', json: credential}, function (error, response, body) {
            assert.ifError(error);
            assert.equal(403, response.statusCode);
            done();
        });
    });



    it('should not signin with invalid credentials', function (done) {
        request.post({url: url + '/signin', json: invalidCredential}, function (error, response, body) {
            assert.ifError(error);
            assert.equal(200, response.statusCode);
            response.body.should.have.property('message');
            response.body.message.should.equal('Invalid password');
            done();
        });

    });

    it('should still not be possible to access info endpoint after invalid login attempt', function (done) {
        request.get(url + '/user/info', function (error, response, body) {
            assert.ifError(error);
            assert.equal(403, response.statusCode);
            done();
        });

    });

    it('should signin with valid credentials', function (done) {
        request.post({url: url + '/signin', json: credential}, function (error, response, body) {
            assert.ifError(error);
            assert.equal(200, response.statusCode);
            response.body.should.have.property('message');
            response.body.message.should.equal('');
            done();
        });

    });

    it('should access info endpoint', function (done) {
        request.get(url + '/user/info', function (error, response, body) {
            assert.ifError(error);
            assert.equal(200, response.statusCode);
            var body = JSON.parse(response.body);
            body.should.have.property('email');
            body.should.have.property('_id');
            done();
        });
    });

    it('should logout', function (done) {
        request.get(url + '/signout', function (error, response, body) {
            assert.ifError(error);
            response.should.have.property('statusCode', 302);
            response.headers.should.have.property('location', '/');
            done();
        });
    });

    it('should still not be possible to access info endpoint after sign out', function (done) {
        request.get(url + '/user/info', function (error, response, body) {
            assert.ifError(error);
            assert.equal(403, response.statusCode);
            done();
        });

    });

});