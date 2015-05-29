
// # comment

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var paginate = require('express-paginate');

exports = module.exports = function(Comment) {

  function index(req, res, next) {
    Comment.paginate({}, req.query.page, req.query.limit, function(err, pageCount, comments, itemCount) {
      if (err) {
        return next(err);
      }

      res.format({
        html: function() {
          res.render('comments', {
            comments: comments,
            pageCount: pageCount,
            itemCount: itemCount
          });
        },
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount, comments.length),
            data: comments
          });
        }
      });
    });
  }

  function _new(req, res, next) {
    res.render('comments/new');
  }

  function create(req, res, next) {
    if (!_.isString(req.body.message) || _.isBlank(req.body.message)) {
      return next({
        param: 'message',
        message: 'Message is missing or blank'
      });
    }

    Comment.create({
      message: req.body.message
    }, function(err, comment) {
      if (err) {
        return next(err); 
      }

      res.format({
        html: function() {
          req.flash('success', 'Successfully created comment');
          res.redirect('/comments');
        },
        json: function() {
          res.json(comment);
        }
      });
    });
  }

  function show(req, res, next) {
    Comment.findById(req.params.id, function(err, comment) {
      if (err) {
        return next(err);
      }

      if (!comment) {
        return next(new Error('Comment does not exist'));
      }

      res.format({
        html: function() {
          res.render('comments/show', {
            comment: comment
          });
        },
        json: function() {
          res.json(comment);
        }
      });
    });
  }

  function edit(req, res, next) {
    Comment.findById(req.params.id, function(err, comment) {
      if (err) {
        return next(err);
      }

      if (!comment) {
        return next(new Error('Comment does not exist'));
      }

      res.render('comments/edit', {
        comment: comment
      });
    });
  }

  function update(req, res, next) {
    Comment.findById(req.params.id, function(err, comment) {
      if (err) {
        return next(err);
      }

      if (!comment) {
        return next(new Error('Comment does not exist'));
      }

      if (!_.isString(req.body.message) || _.isBlank(req.body.message)) {
        return next({
          param: 'message',
          message: 'Name is missing or blank'
        });
      }

      comment.message = req.body.message;
      comment.save(function(err, comment) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully updated comment');
            res.redirect('/comments/' + comment.id);
          },
          json: function() {
            res.json(comment);
          }
        });
      });
    });
  }

  function destroy(req, res, next) {
    Comment.findById(req.params.id, function(err, comment) {
      if (err) {
        return next(err);
      }

      if (!comment) {
        return next(new Error('Comment does not exist'));
      }

      comment.remove(function(err) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully removed comment');
            res.redirect('/comments');
          },
          json: function() {
            // inspired by Stripe's API response for object removals
            res.json({
              id: comment.id,
              deleted: true
            });
          }
        });
      });
    });
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/comment' ];
