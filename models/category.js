var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "category";

var _Schema = new Schema({
	  id : {type : String, trim : true, unique : true, lowercase : true},
      parent : { type : String, trim : true, lowercase : true},
	  text : { type : String, trim : true, lowercase : true},
	  data : { type : Object}
 });

_Schema.pre('save', function (next) {
	 var _self = this;
	
	_self.id = this._id;

	 if(!_self.parent){
	 	this.parent = "#";
	 }

	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 