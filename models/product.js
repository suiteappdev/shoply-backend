var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entity = "product";
var path = require("path");

var _reference = require(path.join("../", "models", entity + ".js"));

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
	  _company : { type : Schema.Types.ObjectId , ref : 'company'},
	  _reference :[{ type : Schema.Types.ObjectId , ref : 'reference'}]
 });

_Schema.pre('save', function (next) {
	_self = this;
	 var _found = false;

	for(r in _self._reference){
		_reference.findOne({reference : r, productId : _self.id}, function(err, ref){
			if(ref){
				_found = true;
  				self.invalidate("duplicate", "duplicate reference");
           		done({ code : 11000});
			}else{
				var _ref = new _reference({
					reference : r,
					productId : _self.id,
					_product : mongoose.Types.ObjectId(_self._id),
					_company  :mongoose.Types.ObjectId(_self._company)
				});

				_ref.save(function(err, rs){
					r = mongoose.Types.ObjectId(rs._id);
				});
			}
		});
	}

	if(!_found){
		sq("_product", _self._company, function(err, s){
			_self.id = s.seq;
			console.log("saved")
			next();
		});		
	}
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 