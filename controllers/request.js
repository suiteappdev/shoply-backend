module.exports = function(app, apiRoutes, io){
  	var _entity ="request";
  	var _url_alias = "pedido";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 

       Model
       .find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .populate("_company")
       .populate("_seller")
       .populate("_client")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getRange(req, res){

      var REQ = req.params; 
      var data = {};

      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

      if(REQ.seller){
        data._seller = mongoose.Types.ObjectId(REQ.seller);
      }

      if(REQ.client){
        data._client = mongoose.Types.ObjectId(REQ.client);
      }

      if(REQ.ini && REQ.end){
        var startDate = new Date(REQ.ini); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")

        startDate.setSeconds(0);
        startDate.setHours(0);
        startDate.setMinutes(0);

        var dateMidnight = new Date(REQ.end);

        dateMidnight.setHours(23);
        dateMidnight.setMinutes(59);
        dateMidnight.setSeconds(59);

        data.createdAt = {
            $gte: startDate,
            $lt: dateMidnight
          }
      }

       Model
       .find(data)
       .populate("_company")
       .populate("_client")
       .populate("_seller")
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
       .findOne({_id : REQ.id})
       .populate("_user")
       .populate("_seller")
       .populate("_company")
       .populate("_client")
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

      !REQ.data || (data.data = REQ.data);

      data.metadata = REQ.metadata;
      data.shoppingCart = REQ.shoppingCart;      
      data._seller = mongoose.Types.ObjectId(REQ._seller);
      data._client = mongoose.Types.ObjectId(REQ._client);
      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
            
  	 var model = new Model(data);

  		model.save(function(err, rs){
  			if(rs){
  				  res.json(rs);
            io.to(rs._company).emit('request', rs);
        }else{
  				res.json(err);
  			}
  		});

    }


    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;
  		!REQ.data || (data.data = REQ.data);
      !REQ.metadata || (data.metadata = REQ.metadata);           
    
      data.shoppingCart = REQ.shoppingCart;      
      data._seller =  mongoose.Types.ObjectId(REQ._seller);
      data._client =  mongoose.Types.ObjectId(REQ._client);
  		
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
    apiRoutes.get("/" + _url_alias + "/:seller/:ini/:end", getRange);
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}