var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "amounts";

var _Schema = new Schema({
	  _company : {type : Schema.Types.ObjectId , ref : 'company'},
	  _grocery : {type : Schema.Types.ObjectId , ref : 'grocery'},
	  _product : {type : Schema.Types.ObjectId , ref : 'product'},
	  amount : { type : Number,  default : 0}
 });

_Schema.pre('save', function (next) {
	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 