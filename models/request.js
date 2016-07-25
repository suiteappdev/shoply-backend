var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "request";

var _Schema = new Schema({
	   id : {type : Number, unique : true},
 	   data : { type : Object},
 	   shoppingCart : Array,
	  _seller : {type : Schema.Types.ObjectId , ref : 'User'},
	  _client : {type : Schema.Types.ObjectId , ref : 'User'},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
	_self = this;
	sq("_request", _self._company, function(err, s){
		_self.id = s.seq;
		next();
	});
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 
