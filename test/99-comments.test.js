
// # tests - comments

var util = require('util');
var request = require('supertest');
var app = require('../app');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var utils = require('./utils');
var async = require('async');
var IoC = require('electrolyte');
var cheerio = require('cheerio');

chai.should();
chai.use(sinonChai);

request = request(app);

// storage for context-specific variables throughout the tests
var context = {};

describe('/comments', function() {

  var Comment = IoC.create('models/comment');

  // Clean DB and add 3 sample comments before tests start
  before(function(done) {
    async.waterfall([
      utils.cleanDatabase,
      function createTestComments(callback) {
        // Create 3 test comments
        async.timesSeries(3, function(i, _callback) {
          var comment = new Comment({
            message: 'Comment #' + i
          });

          comment.save(_callback);
        }, callback);
      }
    ], done);
  });

  // Clean DB after all tests are done
  after(function(done) {
    utils.cleanDatabase(done);
  });

  it('POST /comments - should return 200 if comment was created', function(done) {
    request
      .post('/comments')
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        message: 'Nifty',
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist
        res.body.should.have.property('id');
        res.body.should.have.property('message');

        // Test the values make sense
        res.body.message.should.equal('Nifty');

        // Store this id to use later
        context.commentsIdCreatedWithRequest = res.body.id;

        done();
      });
  });

  it('GET /comments/:id — should return 200 if comments was retrieved', function(done) {
    request
      .get(util.format('/comments/%s', context.commentsIdCreatedWithRequest))
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('message');

        // Test the values make sense
        res.body.message.should.equal('Nifty');

        done();
      });
  });

  it('PUT /comments/:id - should return 200 if comments was updated', function(done) {
    request
      .put(util.format('/comments/%s', context.commentsIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .send({
        message: 'NiftyWhoa'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('message');

        // Test the values make sense
        res.body.message.should.equal('NiftyWhoa');

        done();
      });
  });

  it('DELETE /comments/:id - should return 200 if comments was deleted', function(done) {
    request
      .del(util.format('/comments/%s', context.commentsIdCreatedWithRequest))
      .set({
        'X-Requested-With': 'XMLHttpRequest'// We need to set this so CSRF is ignored when enabled
      })
      .accept('application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.body).to.exist;
        res.body.should.have.property('id');
        res.body.should.have.property('deleted');

        // Test the values make sense
        res.body.id.should.equal(context.commentsIdCreatedWithRequest);
        res.body.deleted.should.equal(true);

        done();
      });
  });

  it('GET /comments - should return 200 if comments index loads (JSON)', function(done) {
    request
      .get('/comments')
      .accept('application/json')
      .expect(200, done);
  });
  
  it('GET /comments - should return 200 if comments index loads and shows 3 rows (HTML)', function(done) {
    request
      .get('/comments')
      .accept('text/html')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        // Test the attributes exist
        expect(res.text).to.exist;

        var $ = cheerio.load(res.text)
        var $commentList = $('table');
        var $commentRows = $commentList.find('tr');

        // Test the values make sense
        $commentList.should.have.length.of(1);
        $commentRows.should.have.length.of.at.least(3);

        done();
      });
  });


});