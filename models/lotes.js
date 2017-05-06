var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entity = "lotes";

function sq(collection, company, callback) {
   mongoose.model("counters").findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');


var _Schema = new Schema({
	  _company : { type : Schema.Types.ObjectId , ref : 'company' },
	  data : { type : Object}
 });

_Schema.pre('save', function (next) {
	_self = this;

	sq("_lotes", _self._company, function(err, s){
		_self.id = s.seq;

		if(s.prefix){
			_self.idcomposed = (s.prefix + s.seq);						
		}
		next();
	});	
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 