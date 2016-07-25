var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "counters";

var _Schema = new Schema({
	  entity :  { type : String , unique : true, required : true, dropDups: true },
      seq : { type: Number},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next, done) {
	var self = this;
    mongoose.models[entity].findOne({entity: self.entity}, function(err, counter) {
        if(err) {
            done(err);
        } else if(counter) {
            self.invalidate("Duplicate", "Duplicate Counter");
            done(new Error("entity name must be unique string"));
        } else {
            done();
        }
    });
    
    next(self);
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 