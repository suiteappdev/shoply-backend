var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "company";

var _Schema = new Schema({
	  _user : {type : Schema.Types.ObjectId , ref : 'User'},
	  _parent : {type : Schema.Types.ObjectId , ref : 'company'},
	  data : { type : Object}
 });

_Schema.pre('save', function (next) {
	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 