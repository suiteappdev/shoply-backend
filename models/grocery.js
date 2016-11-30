var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "grocery";

var _Schema = new Schema({
	  data : { type : Object},
	  _responsible :{ type : Schema.Types.ObjectId , ref : 'User'},
	  _company :{ type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
	_self = this;
	sq("_grocery", _self._company, function(err, s){
		if(s){
		
			if(s.prefix){
				_self.idcomposed = (s.prefix + s.seq);						
			}
			
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