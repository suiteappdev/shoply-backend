var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require("q");
// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

function sq(collection, company, callback) {
   mongoose.model('counters').findOneAndUpdate({ entity: collection, _company :  mongoose.Types.ObjectId(company)}, { $inc: { seq: 1 } }, callback);
}

var entity = "billing";

var _Schema = new Schema({
	 id : {type : Number},
	 idcomposed : { type : String},
	_seller :{ type : Schema.Types.ObjectId , ref : 'User'},
	_company : { type : Schema.Types.ObjectId , ref : 'company'},
	_client : { type : Schema.Types.ObjectId , ref : 'User'},
	_product :  Array,
	_payments : Array,
	data : 		{ type : Object},
	created : {type : Date, default: Date.now }
 });

_Schema.pre('save', function (next) {
	var _self = this;
	var _amounts = mongoose.model('amounts');
	var _task = [];
	
	sq("_invoice", _self._company, function(err, s){
		_self.id = s.seq;

		if(s.prefix){
			_self.idcomposed = (s.prefix + s.seq);						
		}

		for(x in _self._product){

			if(_self._product[x].data.negativo){
				return;
			}

			var where = {
				_grocery: mongoose.Types.ObjectId(_self.data._grocery),
				_product : mongoose.Types.ObjectId(_self._product[x]._id),
				_company: mongoose.Types.ObjectId(_self._company)
			};

			var data = {
				_grocery: mongoose.Types.ObjectId(_self.data._grocery),
				_product : mongoose.Types.ObjectId(_self._product[x]._id),
				_company: mongoose.Types.ObjectId(_self._company),
				$inc : {amount : - _self._product[x].cantidad}
			};

			_task.push(_amounts.update(
			   where,
			   data,
			   {
			     upsert: true,
			   }
			).exec());
		}

		Q.all(_task).then(function(values){
			next();
		});

	});	
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 