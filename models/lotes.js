var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entity = "_lotes";

function sq(collection, company, callback) {
   mongoose.model(entity).findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');


var _Schema = new Schema({
	  _company : {type : Schema.Types.ObjectId , ref : 'company'},
	  data : { type : Object}
 });

_Schema.pre('save', function (next) {
	_self = this;
	sq(entity, _self._company, function(err, s){
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