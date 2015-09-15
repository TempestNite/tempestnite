var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	title: { type: String, required: true },
	pg: String,
	created_at: Date,
	updated_at: Date
});

module.exports = mongoose.model('post', PostSchema);