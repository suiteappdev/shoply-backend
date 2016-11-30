var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}
// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');
var AutoIncrement = require('mongoose-sequence');

var entity = "tonnage";

var _Schema = new Schema({
	  id : {type : Number, unique : true},
	  _company : {type : Schema.Types.ObjectId , ref : 'company'},
	  _client : {type : Schema.Types.ObjectId , ref : 'User'},
	  _seller : {type : Schema.Types.ObjectId , ref : 'User'},
	  _request : [{type : Schema.Types.ObjectId , ref : 'billing'}],
	  data : { type : Object}
	  ini : {type : Date},
	  end : {type : Date},
 });


_Schema.pre('save', function (next) {
	_self = this;
	sq("_tonnage", _self._company, function(err, s){
		_self.id = s.seq;
		next();
	});
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);
//_Schema.plugin(AutoIncrement, {inc_field: 'id'});

module.exports = mongoose.model(entity, _Schema);

