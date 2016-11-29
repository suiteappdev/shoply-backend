module.exports = function(app, apiRoutes, io){
  	var _entity ="amounts";
  	var _url_alias = "cantidades";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function add(req, res){
    		var data = {};
    		var REQ = req.body || req.params;

    		Model.update({ _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), mongoose.Types.ObjectId(req.params.id) }, {$inc :{amount : req.params.amount}}, function(err, rs){
    			if(rs){
    				  res.status(200).json(err || rs);
    			}
    		});
    }


    function remove(req, res){
        Model.update({ _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), _product : mongoose.Types.ObjectId(req.params.id) }, {$dec :{amount : req.params.amount}}, function(err, rs){
          if(rs){
              res.status(200).json(err || rs);
          }
        });
	   }

    apiRoutes.get("/" + _url_alias + "/:id/add/:amount", add);
    apiRoutes.get("/" + _url_alias + "/:id/remove/:amount", remove);

    return this;
}