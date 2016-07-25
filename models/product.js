var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages

function sq(collection) {
   var ret =  mongoose.model('counters').findOneAndUpdate({ entity: collection }, { $inc: { seq: 1 } });
   
   console.log("counter", ret);
   return ret.seq;
}

var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "product";

var _Schema = new Schema({
	  id : {type : Number, unique : true},
	  _category : { type : Schema.Types.ObjectId , ref : 'category'},
	  data : { type : Object},
	  _like : [{type : Schema.Types.ObjectId , ref : 'User'}],
	  _iva : { type : Schema.Types.ObjectId , ref : 'ivas'},
	  comments : { type : Array},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
	_self = this;
	_self.id = sq("_product");
	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 