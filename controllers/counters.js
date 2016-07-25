module.exports = function(app, apiRoutes, io){
  	var _entity ="counters";
  	var _url_alias = "contadores";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 

       Model
       .find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getById(req, res){

      var REQ = req.params; 

       Model
       .findOne({_id : REQ.id, _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function post(req, res){
  		var data = {};
  		var REQ = req.body || req.params;

      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
      data.seq = REQ.min;
      data.entity = REQ._entity;
      data.entityName = REQ.entityName;
      data.initial = REQ.min;
      data.field = REQ.field;
      
  	  var model = new Model(data);

  		model.save(function(err, rs){
        if(!err){
          res.status(200).json(rs);
        }else{
          if(err.code == 11000){
            res.status(409).json(err);
          }else{
            res.status(500).json(err);
          }
        }
  		});
    }


    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;
      
      data.entity = REQ._entity;
      data.seq = REQ.min;
      data.entityName = REQ.entityName;
      data.field = REQ.field;

  		data = { $set : data };          

  		Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data,function(err, rs){
  			if(rs){
  				res.json(err || rs);
  			}
  		});
    }


    function remove(req, res){
        Model.remove({_id : mongoose.Types.ObjectId(req.params.id), _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])}, function(err, rs){
              if(!err)
                  res.json(rs);
              else
                 res.status(500).json(err);
        });
	   }

    apiRoutes.get("/" + _url_alias, get);
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}