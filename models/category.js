var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "category";

var _Schema = new Schema({
	  id : String,
      parent : { type : String, trim : true, lowercase : true},
      _parentObj : { type : Schema.Types.ObjectId , ref : 'category'},
	  text : { type : String, trim : true, lowercase : true},
	  data : { type : Object},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
	 var _self = this;
	
	_self.id = this._id;

	 if(!_self.parent){
	 	this.parent = "#";
		next();
		return;
	 }

	_self._parentObj = mongoose.Types.ObjectId(_self.parent);
	next();

});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 