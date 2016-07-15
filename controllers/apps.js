module.exports = function(app, apiRoutes, io){
  	var _entity ="apps";
  	var _url_alias = "apps";
    var fs = require('fs');
  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));
    var Company = require(path.join("../", "models", "company.js"));
    var Builder = require(path.join("../", "helpers", "apkbuilder", "apkbuilder.js"));
    var crypto = require("crypto");

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
        
        Company.findOne({_id : mongoose.Types.ObjectId(req.headers["x-shoply-company"])}).populate("_user")
       .exec(function(err, rs){
          if(!err){
              var xml2js = require('xml2js');
              var parser = new xml2js.Parser();
              
              fs.readFile(path.join(process.env.PWD, "apps", "shoply-app", "config.xml"), function(err, data) {
                  parser.parseString(data, function (err, result) {
                    crypto.pseudoRandomBytes(10, function (err, raw) {
                            if (err) return cb(err);

                                var _key = raw.toString('hex');
                                var _package = "com.CP"+ _key + "." + "ID" + rs._id.toString(); 
                                var _name = REQ.name;

                                result.widget.$.id = _package;
                                
                                console.log(result.widget.name);

                                var xml2js = require('xml2js');
                                var builder = new xml2js.Builder();
                                var xml = builder.buildObject(result);

                                fs.writeFile(path.join(process.env.PWD, "apps","shoply-app", "config.xml"), xml, function(err){
                                  if(err){
                                      return console.log(err);
                                  }
                                  
                                  Builder.Build(function(output){
                                      Builder.Upload(function(_err, _data){
                                            var data = {};
                                            !REQ.data || (data.data = REQ.data);

                                            data.data.url = _data.url; 
                                            data.data.isPublic = true; 
                                            data._company  = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
                                            data.metadata = REQ.metadata;

                                            var model = new Model(data);

                                            model.save(function(err, rs){
                                                res.status(200).json(rs);
                                            });
                                      });                      
                                  });
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
       .find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
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

    function getPublic(req, res){
      var REQ = req.params; 

       Model.findOne({_id : REQ.id, _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])}).
       populate("_company")
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
       data._company =  mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
       
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
    apiRoutes.get("/" + _url_alias + "/public/:id", getPublic);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.post("/" + _url_alias + "/build/", build);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}