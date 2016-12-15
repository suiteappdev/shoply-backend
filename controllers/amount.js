module.exports = function(app, apiRoutes, io){
  	var _entity ="amounts";
  	var _url_alias = "cantidades";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function add(req, res){
    		var data = {};
    		var REQ = req.body || req.params;

    		Model.update({ _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), _product : mongoose.Types.ObjectId(req.params.id)}, {$inc :{amount : req.params.amount}}, function(err, rs){
    			if(rs){
    				  res.status(200).json(err || rs);
    			}
    		});
    }

    function stock(req, res){
        var data = {};
        var REQ = req.body || req.params;
        var _where = {};
        _where._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

        if(req.params._product){
              _where._product = mongoose.Types.ObjectId(req.params._product)
        }

        if(req.params._grocery){
          _where._grocery = mongoose.Types.ObjectId(req.params._grocery);
        }

        if(req.params.negativo){
          _where.negativo = req.params.negativo;
        }

        if(req.params._commercial_home){
          _where._commercial_home = req.params._commercial_home;
        }


        Model.find(_where).populate("_grocery _product").exec(function(err, rs){
                if(rs){
                    res.status(200).json(err || rs);
                }
            });
    }

    function stockDetail(req, res){
        var data = {};
        var REQ = req.body || req.params;
        var _where = {};

        _where._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

        if(req.body._product){
              _where._product = mongoose.Types.ObjectId(req.body._product); 
        }

        if(req.body._grocery){
          _where._grocery = mongoose.Types.ObjectId(req.body._grocery);
        }

        if(req.body.negativo){
          _where.negativo = req.body.negativo;
        }

        if(req.body._commercial_home){
          _where._commercial_home =  mongoose.Types.ObjectId(req.body._commercial_home);
        }


        Model.find(_where).populate("_grocery _product").populate({
          path: '_product._commercial_home',
          match: { _id:  mongoose.Types.ObjectId(req.body._commercial_home)},
        }).exec(function(err, rs){
                if(rs){
                    res.status(200).json(err || rs);
                }
            });
    }

    function byProduct(req, res){
        var data = {};
        var REQ = req.body || req.params;
        
        Model.find(
            { 
              _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), 
              _product : mongoose.Types.ObjectId(req.params._product) 
              }).populate("_grocery _product").exec(function(err, rs){
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
    apiRoutes.get("/" + _url_alias + "/stock/:_grocery/:_product", stock);
    apiRoutes.get("/" + _url_alias + "/stock/:_product", byProduct);
    apiRoutes.post("/" + _url_alias + "/stock/detail", stockDetail);

    return this;
}