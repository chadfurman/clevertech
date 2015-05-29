
// # comment

var jsonSelect = require('mongoose-json-select');
var mongoosePaginate = require('mongoose-paginate');

exports = module.exports = function(mongoose, iglooMongoosePlugin) {

  var Comment = new mongoose.Schema({
    message: {
      type: String,
      required: true
    }
  });

  // virtuals
  Comment.virtual('object').get(function() {
    return 'comment';
  });

  // plugins
  //Comment.plugin(jsonSelect, '-_group -salt -hash');
  Comment.plugin(mongoosePaginate);

  // keep last
  Comment.plugin(iglooMongoosePlugin);

  return mongoose.model('Comment', Comment);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ];
