module.exports = function(app, apiRoutes, io){
  	var _entity ="category";
  	var _url_alias = "categoria";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 

       Model
       .find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .populate("_parentObj")
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
       .populate("_parentObj")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getRoot(req, res){
      var REQ = req.params;
      console.log("categoria raiz ->incoming request", req.headers["x-shoply-company"]);
       Model
       .find({parent : "#", _company :mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getChilds(req, res){
        var REQ = req.params;
        console.log("incoming request", REQ);
        Model.find({parent : REQ.parent, _company: mongoose.Types.ObjectId(req.headers["x-shoply-company"])}).populate("_parentObj").exec(function(err, rs){
            if(!err){
              res.json(rs)
             }else{
                res.json(err);
             }
        });
    }


    function post(req, res){
  		var data = {};
  		var REQ = req.body || req.params;

      !REQ.data || (data.data = REQ.data); 
      
      data.id = new mongoose.Types.ObjectId();      
      data.text = REQ.text;
      data.parent = REQ.parent;
      data._company = req.headers["x-shoply-company"];
            
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
      data.text = REQ.text;
      data.parent = REQ.parent;
      try{
        data._parentObj = mongoose.Types.ObjectId(REQ.parent);
      }catch(e){
        data._parentObj = "#";
      }finally{
        data = { $set : data };          
        Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data,function(err, rs){
          if(rs){
            res.json(err || rs);
          }
        });        
      }
    }


    function remove(req, res){
        Model.remove({_id : mongoose.Types.ObjectId(req.params.id)}, function(err, rs){
              if(!err)
                  res.json(rs);
              else
                 res.status(500).json(err);
        });
	}

    apiRoutes.get("/" + _url_alias, get);
    apiRoutes.get("/" + _url_alias + "/root", getRoot);
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.get("/" + _url_alias + "/childs/:parent", getChilds);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}