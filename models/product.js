var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entity = "product";

//var _reference = require(path.join("../", "models", entity + ".js"));

// Load required packages

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');


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

	console.log("ID", _self._id);

	sq("_product", _self._company, function(err, s){
		_self.id = s.seq;
		next();
	});

});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 