var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "inputs";

var _Schema = new Schema({
	  id : {type : Number},
	  idcomposed : { type : String},
	  _company : {type : Schema.Types.ObjectId , ref : 'company'},
	  _responsible : {type : Schema.Types.ObjectId , ref : 'User'},
	  _grocery :{type : Schema.Types.ObjectId , ref : 'grocery'},
	  _author : {type : Schema.Types.ObjectId , ref : 'User'},
	  data : Object
 });

_Schema.pre('save', function (next) {
	_self = this;
	sq("_inputs", _self._company, function(err, s){
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

_Schema.post('save', function () {
	var _self = this;
	var _amounts = mongoose.model('amounts');

	for(x in _self.data._product){
		var where = {
			_grocery: mongoose.Types.ObjectId(_self._grocery),
			_product : mongoose.Types.ObjectId(_self.data._product[x]._id),
			_company: mongoose.Types.ObjectId(_self._company)
		};

	    _amounts.findOne(where, function(err, rs){
	        if(rs){
	        	var amount = (rs.amount + parseInt(_self.data._product[x].cantidad));
	        	rs.amount = amount;

	        	rs.save(function(err, rs){
	             	if(!err){
	             		console.log("actualizando cantidades", rs);
	             	}	        		
	        	});
	        }else{
	        	console.log("cantidad", _self.data._product[x].cantidad);
	            var inputs = new _amounts({
	            	_company : mongoose.Types.ObjectId(_self._company),
	            	_grocery : mongoose.Types.ObjectId(_self._grocery),
	            	_product : mongoose.Types.ObjectId(_self.data._product[x]._id),
	            	amount : parseInt(_self.data._product[x].cantidad)
	            });

	            inputs.save(function(err, rs){
	            	if(!err){
	            		console.log("Cantidades alternas creadas", rs);
	            		delete inputs;
	            	}
	            });
	        }
	    });
	}
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 