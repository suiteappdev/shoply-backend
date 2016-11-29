module.exports = function(app, apiRoutes, io){
  	var _entity ="inputs";
  	var _url_alias = "entradas";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 
       Model
       .find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .populate("_company _responsible _author")
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
       .populate("_company _responsible _author")
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
      !REQ.metadata || (data.metadata = REQ.metadata);

      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

      if(REQ._responsible){
         data._responsible = mongoose.Types.ObjectId(REQ._responsible);
      }

      if(REQ._author){
         data._author = mongoose.Types.ObjectId(REQ._author);
      }

      if(REQ._grocery){
         data._grocery = mongoose.Types.ObjectId(REQ._grocery);
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
      !REQ.metadata || (data.metadata = REQ.metadata);
       
      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);

      if(REQ._responsible){
         data._responsible = mongoose.Types.ObjectId(REQ._responsible);
      }

      if(REQ._author){
         data._author = mongoose.Types.ObjectId(REQ._author);
      }

  		data = { $set : data };          

  		Model.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data,function(err, rs){
  			if(rs){
  				res.json(err || rs);
  			}
  		});
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
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}