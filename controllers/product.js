module.exports = function(app, apiRoutes, io){
  	var _entity ="product";
  	var _url_alias = "producto";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 

       Model
       .find({_company: mongoose.Types.ObjectId(req.headers["x-soply-company"])})
       .populate("_category")
       .populate("_company")
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
        .populate("_category")
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
       .find({_category : mongoose.Types.ObjectId(REQ.id)})
       .populate("_category")
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
      !REQ._category || (data._category = mongoose.Types.ObjectId(REQ._category)); 
      !REQ._company || (data._company = mongoose.Types.ObjectId(req.headers["x-soply-company"]));  
      
  		var model = new Model(data);

  		model.save(function(err, rs){
  			if(rs){
  				res.json(rs);
  			}else{
  				res.json(err);
  			}
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
    apiRoutes.get("/" + _url_alias + "/category/:id", getProductByCategory);
    apiRoutes.post("/" + _url_alias + "/:id/like", like);

    //comments-route
    apiRoutes.post("/" + _url_alias + "/:id/comentar", comment);
    
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}