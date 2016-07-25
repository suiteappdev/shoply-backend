var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "counters";

var _Schema = new Schema({
	  field : { type : String },
	  entity :  { type : String , required : true, dropDups: true },
      entityName: { type : String},
      initial : { type: Number},
      seq : { type: Number},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
	var self = this;
    
    mongoose.models[entity].findOne({ entity: self.entity, _company : mongoose.Types.ObjectId(self._company)}, function(err, counter) {
        if(err) {
            done(err);
        } else if(counter) {
            self.invalidate("duplicate", "counter must be unique");
            done(new Error("counter must be unique"));
        } else {
            done();
        }
    });

	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 