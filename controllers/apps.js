module.exports = function(app, apiRoutes, io){
  	var _entity ="apps";
  	var _url_alias = "apps";
    var fs = require('fs');
  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));
    var Company = require(path.join("../", "models", "company.js"));
    var Builder = require(path.join("../", "helpers", "apkbuilder", "apkbuilder.js"));


    function getCompany(req, res){

      var REQ = req.params; 

       Company
       .find()
       .populate("_user")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function build(req, res){
        var REQ = req.body || req.params;
        
        Company.findOne({_id : mongoose.Types.ObjectId(REQ._company)}).populate("_user")
       .exec(function(err, rs){
          if(!err){
            fs.writeFile(path.join(process.env.PWD, "apps","shoply-app", "www", "js", "company.json"), JSON.stringify(rs), function(err){
              if(err){
                  return console.log(err);
              }
              
              Builder.Build(function(output){
                  Builder.Upload(function(_err, _data){
                        var app = {};
                        app.data = data; 
                        app._company  = REQ._company;

                        var model = new Model(app);

                        model.save(function(err, rs){
                            res.status(200).json(rs);
                        });
                  });                      
              });
            });
          }
       });
    }

    function get(req, res){

      var REQ = req.params; 

       Model
       .find()
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
       data._company =  mongoose.Types.ObjectId(req.headers["x-soply-company"]);
       
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

    apiRoutes.get("/" + _url_alias +"/company/", getCompany);
    
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.post("/" + _url_alias + "/build/", build);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}