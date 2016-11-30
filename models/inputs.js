var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "inputs";

var _Schema = new Schema({
	  _company : {type : Schema.Types.ObjectId , ref : 'company'},
	  _responsible : {type : Schema.Types.ObjectId , ref : 'User'},
	  _grocery :{type : Schema.Types.ObjectId , ref : 'grocery'},
	  _author : {type : Schema.Types.ObjectId , ref : 'User'},
	  data : Object
 });

_Schema.pre('save', function (next) {
	var _self = this;
	next();
});

_Schema.post('save', function () {
	var _self = this;
	var _amounts = mongoose.model('amounts');

	for(x in _self.data._product){
		var where = {_grocery: mongoose.Types.ObjectId(_self._grocery), _product : mongoose.Types.ObjectId(_self.data._product[x]._id)};

	    _amounts.findOne(where, function(err, rs){
	        if(rs){
	             rs.update(where, {$inc :{ amount : _self.data._product[x].cantidad}}, function(err, doc){
	             	if(!err){
	             		console.log("actualizando cantidades", doc);
	             	}
	             });
	        }else{
	            var inputs = new _amounts({
	            	_grocery : mongoose.Types.ObjectId(_self._grocery),
	            	_product : mongoose.Types.ObjectId(_self.data._product[x]._id),
	            	amount : _self.data._product[x].cantidad
	            });
	            
	            inputs.save(function(err, rs){
	            	if(!err){
	            		console.log("Cantidades alternas creadas", rs);
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