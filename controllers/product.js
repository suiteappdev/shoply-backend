module.exports = function(app, apiRoutes, io){
  	var _entity ="product";
  	var _url_alias = "producto";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 

       Model
       .find({_company: mongoose.Types.ObjectId(req.headers["x-shoply-company"]), trashed : false})
       .populate("_category")
       .populate("_company")
       .populate("_reference")
       .populate("_commercial_home")
       .populate("_iva")
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
       .findOne({_id : REQ.id, trashed : false})
        .populate("_category")
        .populate("_company")
        .populate("_commercial_home")
        .populate("_reference")
        .populate("_iva")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getProductByCategory(req, res){

      var REQ = req.params; 

        Model
       .find({_category : mongoose.Types.ObjectId(REQ.id),  _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), trashed : false})
       .populate("_category")
       .populate("_company")
       .populate("_commercial_home")
       .populate("_reference")
       .populate("_iva")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else{
              res.json(err);
           }
       });
    }


    function post(req, res){
  		var data = {};
  		var REQ = req.body || req.params;

      !REQ.data || (data.data = REQ.data);
      !REQ._category || (data._category = mongoose.Types.ObjectId(REQ._category)); 
      !REQ._iva || (data._iva = mongoose.Types.ObjectId(REQ._iva));

      if(REQ._reference){
          data.data._reference = [];

        for(r in REQ._reference){
          data.data._reference.push(REQ._reference[r]);
        }
      }

      if(REQ._commercial_home){
        data._commercial_home = mongoose.Types.ObjectId(REQ._commercial_home)
      }

     
      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);  
      
  		var model = new Model(data, { strict : false });

  		model.save(function(err, rs){
          if (err)
            return res.status(409).send(err);

        res.json(rs);
  		});

    }

    function like(req, res){
      var data = {};
      var REQ = req.body || req.params;
      !REQ.data || (data.data = REQ.data);

      Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, {$addToSet : { _like : mongoose.Types.ObjectId(REQ.user) }}, function(err, rs){
        if(rs){
          res.json(err || rs);
        }
      }); 
    }

    function unlike(){
      var data = {};
      var REQ = req.body || req.params;
      !REQ.data || (data.data = REQ.data); 
    }

    function comment(req, res){
      var data = {};

      var REQ = req.body || req.params;
      !REQ.data || (data.data = REQ.data);
      data.data.createdAt = new Date();

      Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, {$addToSet : { comments :data }}, function(err, rs){
        if(rs){
            res.json(err || rs);
        }
      }); 
    }

    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;
  		!REQ.data || (data.data = REQ.data);             
      !REQ._iva || (data._iva = mongoose.Types.ObjectId(REQ._iva));
      !REQ._category || (data._category = mongoose.Types.ObjectId(REQ._category));
      
      if(REQ._commercial_home){
        data._commercial_home = mongoose.Types.ObjectId(REQ._commercial_home)
      }

		  data = { $set : data }; 

      var _ref_id = REQ._reference._id;
      delete REQ._reference._id;

      mongoose.model("reference").update({_id : mongoose.Types.ObjectId(_ref_id) }, REQ._reference, function(error, refs){
         if(!error){
            Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data,function(err, rs){
              if(rs){
                res.json(err || rs);
              }
            });          
         }
      });     
    }    

  function remove(req, res){
      Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, { trashed : true} , function(err, rs){
        if(rs){
          res.json(err || rs);
        }
      }); 
	}

  function getServices(req, res){
      var REQ = req.params; 

       Model
       .find({_company: mongoose.Types.ObjectId(req.headers["x-shoply-company"]), trashed : false, "data.servicio" : true})
       .populate("_category")
       .populate("_company")
       .populate("_reference")
       .populate("_commercial_home")
       .populate("_iva")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       }); 
  }

    apiRoutes.get("/" + _url_alias, get);
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.get("/" + _url_alias + "/category/:id", getProductByCategory);
    apiRoutes.get("/" + _url_alias + "/service/", getServices);
    apiRoutes.post("/" + _url_alias + "/:id/like", like);

    //comments-route
    apiRoutes.post("/" + _url_alias + "/:id/comentar", comment);
    
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}