module.exports = function(app, apiRoutes, io){
  	var _entity ="billing";
  	var _url_alias = "facturacion";

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

      !REQ.data || (data.data = REQ.data);

      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
      data._payments = REQ._payments;
      data._product = REQ._product;
      data._client = mongoose.Types.ObjectId(REQ._client);
      data._seller = mongoose.Types.ObjectId(REQ._seller);
      
  	   var model = new Model(data);

  		model.save(function(err, rs){
    			if(rs){
            model.populate("_company _client _seller", function(err, doc){
              res.json(doc);
            })
    			}else{
    				res.json(err);
    			}
  		});

    }


    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;
      
      !REQ.data || (data.data = REQ.data);
      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]); 
      data._product = REQ._product;              
      data._payments = REQ._payments;              

  		data = { $set : data };          

  		Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data, function(err, rs){
  			if(rs){
  				 res.json(err || rs);
  			}
  		});
    }

    function find(req, res){
      var REQ = req.body || req.params;
      var _data = {};
          _data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

      if(REQ.ini && REQ.end){
        var startDate = new Date(REQ.ini);
        var dateMidnight = new Date(REQ.end);

        console.log("startDate", startDate.toISOString());
        console.log("dateMidnight", dateMidnight.toISOString());

        _data.createdAt = {$gte: startDate , $lt: dateMidnight};
        console.log("data", _data.createdAt);
      }    

      if(REQ._client){
        _data._client = mongoose.Types.ObjectId(REQ._client);
      }

      if(REQ._seller){
        _data._seller = mongoose.Types.ObjectId(REQ._seller);
      }

      if(REQ.factura){
        _data.id = REQ.factura;
      }

       Model
       .find(_data)
       .populate("_client _seller")
       .exec(function(err, rs){
           if(!err)
           {
            res.status(200).json(rs);
           }
           else
            res.status(200).json(err);
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
    apiRoutes.post("/" + _url_alias + "/find", find);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}