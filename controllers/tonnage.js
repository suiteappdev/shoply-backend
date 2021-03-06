module.exports = function(app, apiRoutes, io){
  	var _entity ="tonnage";
  	var _url_alias = "arqueos";

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
       .populate("_request")
       .exec(function(err, rs){
          if (err) return res.status(500).json(err);                
        
          var options =[   
             {   
               path: '_request._client',   
               model: 'User'   
             }, 
             {   
               path: '_request._seller',   
               model: 'User'   
             }    
           ];    
        
           Model.populate(rs, options, function (err, data) {
             res.status(200).json(data);   
           });   
       });
    }

    function getById(req, res){

      var REQ = req.params; 

       Model
       .findOne({_id : REQ.id, _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .populate("_company")
       .populate("_request")
       .populate("_seller")
       .exec(function(err, rs){
          var options =[   
             {   
               path: '_request',   
               model: 'request'   
             }, 
             {   
               path: '_seller',   
               model: 'User'   
             },    
             {   
               path: '_seller',   
               model: 'User'   
             },    
             {   
               path: '_client',   
               model: 'User'   
             }   
           ];    
    
            if (err) return res.status(500).json(err);                
        
           Model.populate(rs, options, function (err, data) {
             res.status(200).json(data);   
           });   
       });
    }

    function post(req, res){
  		var data = {};
  		var REQ = req.body || req.params;

      !REQ.data || (data.data = REQ.data);
      !REQ.metadata || (data.metadata = REQ.metadata);
      data._company =  mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
      data._seller = mongoose.Types.ObjectId(REQ._seller);

      if(REQ.ini){
        data.ini = new Date(REQ.ini);
      }


      if(REQ.end){
        data.end = new Date(REQ.end);
      }
       
       if(REQ._request){
          data._request = [];
          for(x in REQ._request){
              data._request.push(mongoose.Types.ObjectId(REQ._request[x]));
          }
       }

  	   var model = new Model(data);

  		model.save(function(err, rs){
    			if(rs){
    				res.json(rs);
    			}else{
    				res.json(err);
    			}
  		});

    }


    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;

  		!REQ.data || (data.data = REQ.data);             
      
      data._company =  mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
  		data = { $set : data };          

  		Model.update({ _id : mongoose.Types.ObjectId(req.params.id), _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])}, data,function(err, rs){
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

    function find(req, res){
      var REQ = req.body || req.params;
      var _data = {};
          _data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

      if(REQ.ini){
          _data.ini = new Date(REQ.ini).toISOString();
      }

      if(REQ.end){
          _data.end = new Date(REQ.end).toISOString();
      }

      if(REQ._seller){
        _data._seller = mongoose.Types.ObjectId(REQ._seller);
      }

       Model
       .find(_data)
       .populate("_client _seller _company")
       .exec(function(err, rs){
           if(!err)
           {
            res.status(200).json(rs);
           }
           else
            res.status(200).json(err);
       });
    }

    apiRoutes.get("/" + _url_alias, get);
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.post("/" + _url_alias + "/find", find);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}