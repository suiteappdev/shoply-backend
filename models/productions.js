var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require("q");
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

// Load required packages

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "_productions";

var _Schema = new Schema({
	  data : { type : Object}
 });

_Schema.pre('save', function (next) {
	_self = this;
	sq("_productions", _self._company, function(err, s){
		if(s){
			_self.id = s.seq;
			next();			
		}else{
			next();
		}
	});
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 