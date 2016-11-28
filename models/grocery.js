var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "grocery";

var _Schema = new Schema({
	  data : { type : Object},
	  _responsible :{ type : Schema.Types.ObjectId , ref : 'User'},
	  _company :{ type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 