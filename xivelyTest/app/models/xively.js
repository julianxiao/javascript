var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var XivelySchema   = new Schema({
	xivelyPostData: Object
});

module.exports = mongoose.model('Xively', XivelySchema);
