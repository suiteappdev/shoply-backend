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
	  idcomposed : { type : String},
	  _category : { type : Schema.Types.ObjectId , ref : 'category'},
	  data : { type : Object},
	  _like : [{type : Schema.Types.ObjectId , ref : 'User'}],
	  _iva : { type : Schema.Types.ObjectId , ref : 'ivas'},
	  comments : { type : Array},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'},
	  _reference : { type : Schema.Types.ObjectId , ref : 'reference'}
 });

_Schema.pre('save', function (next, done) {
	_self = this;

	for(r in _self.data._reference){
		var _reference = mongoose.model('reference');

		_reference.findOne({reference : _self.data._reference[r]}, function(err, ref){
			if(ref){
			  	_self.invalidate("duplicate", "duplicate reference");
    			done({ code : 11000, reference:  _self.data._reference[r]});
			}else{
				sq("_product", _self._company, function(err, s){
					_self.id = s.seq;
					
					console.log("counter", s);

					console.log("prefix", s.prefix);

					if(s.prefix){
						console.log("composed", (s.prefix + s.seq));
						_self.idcomposed = (s.prefix + s.seq);						
					}

					var _reference = mongoose.model('reference');

					var _ref = new _reference({
						reference : _self.data._reference || [_self.id.toString()],
						productId : _self.id,
						_product : mongoose.Types.ObjectId(_self._id),
						_company  :mongoose.Types.ObjectId(_self._company)
					});

					_ref.save(function(err, rs){
						if(rs){
							_self._reference = mongoose.Types.ObjectId(rs._id);
							delete _self.data._reference;
							next();
						}
					})
				});				
			}
		});
	}
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 