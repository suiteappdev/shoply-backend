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
	  amount : { type : Number}
 });

_Schema.pre('save', function (next) {
	_self = this;
	next();
});

_Schema.pre('update', function() {
	var _self = this;
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 