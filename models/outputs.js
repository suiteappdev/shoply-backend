var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require("q");

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "outputs";

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
	console.log("on save hook ", this);
	var _self = this;
	var _amounts = mongoose.model('amounts');
	var _task = [];

	for(x in _self.data._product){

		var where = {
			_grocery: mongoose.Types.ObjectId(_self._grocery),
			_product : mongoose.Types.ObjectId(_self.data._product[x]._id),
			_company: mongoose.Types.ObjectId(_self._company)
		};

		var data = {
			_grocery: mongoose.Types.ObjectId(_self._grocery),
			_product : mongoose.Types.ObjectId(_self.data._product[x]._id),
			_company: mongoose.Types.ObjectId(_self._company),
			$dec : {amount : _self.data._product[x].cantidad}
		};

		_task.push(_amounts.update(
		   where,
		   data
		).exec());
	}

	Q.all(_task).then(function(values){
		console.log("result", values);
	});
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 