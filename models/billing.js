var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "billing";

var _Schema = new Schema({
	 id : {type : Number},
	 idcomposed : { type : String},
	_company : { type : Schema.Types.ObjectId , ref : 'company'},
	_client : { type : Schema.Types.ObjectId , ref : 'User'},
	_product :  Array,
	_payments : Array,
	data : 		{ type : Object}
 });

_Schema.pre('save', function (next) {
	_self = this;
	
	sq("_invoice", _self._company, function(err, s){
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