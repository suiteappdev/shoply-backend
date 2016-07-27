var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entity = "product";
var path = require("path");

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

_Schema.pre('save', function (next, done) {
	_self = this;

	for(r in _self.data._reference){
		var _reference = mongoose.model('reference');

		_reference.findOne({reference : _self.data._reference[r]}, function(err, ref){
			if(ref){
			  	_self.invalidate("duplicate", "duplicate reference");
    			done({ code : 11000, reference:  _self.data._reference[r]});
			}
		});
	}

	sq("_product", _self._company, function(err, s){
		_self.id = s.seq;
		var refs = [];
		var job = mongoose.model('reference').initializeUnorderedBulkOp();
		
		for(r in _self.data._reference){
			var _ref = new _reference({
				reference : _self.data._reference[r],
				productId : _self.id,
				_product : mongoose.Types.ObjectId(_self._id),
				_company  :mongoose.Types.ObjectId(_self._company)
			});

			job.insert(_ref);
		}

		job.execute(function(err, result) {
		    if (err) console.error(err);
		    console.log('Inserted ' + result.nInserted + ' row(s).');
			next();			
		}
	});	
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 