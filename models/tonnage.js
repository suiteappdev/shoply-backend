var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');
var AutoIncrement = require('mongoose-sequence');

var entity = "tonnage";

var _Schema = new Schema({
	  _company : {type : Schema.Types.ObjectId , ref : 'company'},
	  _request : [{type : Schema.Types.ObjectId , ref : 'request'}],
	  data : { type : Object}
 });


_Schema.pre('save', function (next) {
	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);
//_Schema.plugin(AutoIncrement, {inc_field: 'id'});

module.exports = mongoose.model(entity, _Schema);

