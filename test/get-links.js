var restify = require('restify'),
    should = require('should'),
    paginate = require('../'),
    request = require('request-promise'),
    url = require('url'),
    server;

describe('The getLinks() function', function () {
    before(function (done) {
        server = restify.createServer({
            name: 'test'
        });

        server.use(restify.queryParser());

        server.use(paginate(server));

        server.get('/test', function (req, res, next) {
            res.send({
            	pages: res.paginate.getLinks(10)
            });
        });

        server.listen(8888, done);
    });

    it('should add the params of the initial request to the generated links, except for page', function(done) {
    	request({
            uri: 'http://localhost:8888/test?testparam=test&page=2&per_page=2',
            json: true
        }).then(function (res) {
            var nextLinkParams = url.parse(res.pages.next, true).query;
            nextLinkParams.should.have.property('testparam', 'test');
            nextLinkParams.should.have.property('per_page', '2');
            nextLinkParams.should.not.have.property('page', '2');
            done();
        }, function (err) {
            console.log(err);
            done(err);
        });
    });

    it('shouldn\'t return an empty last page, in case count % per_page === 0', function(done) {
        request({
            uri: 'http://localhost:8888/test?page=2&per_page=2',
            json: true
        }).then(function (res) {
            var lastLinkParams = url.parse(res.pages.last, true).query;

            // the count is 10 and per_page is 2, therefore the last page should be 5
            lastLinkParams.should.have.property('page', '5');
            
            done();
        }, function (err) {
            console.log(err);
            done(err);
        });
    });
});