var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages

function sq(collection) {
   var ret = db.counters.findAndModify(
          {
            query: { entity: collection },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}

var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "counters";

var _Schema = new Schema({
	  entity :  { type : String , unique : true, required : true, dropDups: true },
      entityName: { type : String },
      seq : { type: Number},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'}
 });

_Schema.pre('save', function (next) {
    next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 