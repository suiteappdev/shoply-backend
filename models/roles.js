
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var base_path = process.env.PWD;


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');



var _Schema = new Schema({
	 
	  name : { type : String, trim : true, required: true},
	  privileges : {type :String, required : true},
	  _user : [{ type : Schema.Types.ObjectId , ref : 'User'}]

});


_Schema.statics.setup = function(callback){

	var data = require(base_path + "/setup.js");

	_self = this;

	this.find({}).remove({}).exec(function(){


			_self.collection.insert(data.roles, function(err,rs){

					callback(err, rs);

			});


	});


}


_Schema.pre('save', function (next) {
  
 // do stuff

  next();
  
});


//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);


module.exports = mongoose.model('Role', _Schema); 