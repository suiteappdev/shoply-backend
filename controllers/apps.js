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
    var multer = require("multer");
    var styleParser = require("cssjson");
    
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'apps/shoply-app/resources')
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname +  path.extname(file.originalname))
      }
    })

    var upload = multer({ storage: storage});
    var cpUpload = upload.fields([{ name: 'icon'}, { name: 'splash'}])
    
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
                                
                                console.log(_package);
                                
                                var _bodyData =  JSON.parse(REQ.data);

                                console.log("appname", _bodyData.name);
                                result.widget.$.id = _package;
                                result.widget.name = _bodyData.name;

                                var xml2js = require('xml2js');
                                var builder = new xml2js.Builder();
                                var xml = builder.buildObject(result);
                                
                                //read theme.css
                                fs.readFile(path.join(process.env.PWD, "apps", "shoply-app", "www", "css",  "theme.css"), "utf8", function (err, styles) {
                                    if (err) {
                                      return console.log(err);
                                    }

                                    // To JSON
                                    var json = styleParser.toJSON(styles);

                                    json.children['.bar .title'].attributes = {
                                      color:_bodyData.headerText+"!important;"
                                    };

                                    json.children['.bar-header'].attributes = {
                                      "background-color":_bodyData.headerColor+"!important;"
                                    };

                                    json.children['.tab-title'].attributes = {
                                      color:_bodyData.footerText+"!important;"
                                    };

                                    json.children['.tabs'].attributes = {
                                      "background-color":_bodyData.footerColor+"!important;"
                                    };

                                    json.children['.tab-item .icon'].attributes = {
                                      color:_bodyData.footerText+"!important;"
                                    };

                                    json.children['.custom-list-tab'].attributes = {
                                      "background-color":_bodyData.productButtonBackground+"!important;"
                                    };

                                    json.children['.action-product i'].attributes = {
                                      color:_bodyData.productBotonColor+"!important;"
                                    };

                                    json.children['.action-product'].attributes = {
                                      color:_bodyData.productButtonBackground+"!important;"
                                    };

                                    json.children['.button.button-custom'].attributes = {
                                      "background-color":_bodyData.primaryButtonBackground+"!important;",
                                       color:_bodyData.primaryButtonColor+"!important;"
                                    };

                                    json.children['.register-text'].attributes = {
                                      color:_bodyData.primaryButtonBackground+"!important;"
                                    };

                                    json.children['.badge.badge-positive'].attributes = {
                                      "background-color":_bodyData.notificatorBackgroundColor+"!important;",
                                       color:_bodyData.notificatorIconColor+"!important;"
                                    };


                                    fs.writeFile(path.join(process.env.PWD, "apps", "shoply-app", "www", "css",  "theme.css"), styleParser.toCSS(json), function(err){
                                      if(err){
                                        return console.log(err);
                                      }

                                      fs.writeFile(path.join(process.env.PWD, "apps","shoply-app", "config.xml"), xml, function(err){
                                        if(err){
                                            return console.log(err);
                                        }
                                        //write app.json data
                                        fs.writeFile(path.join(process.env.PWD, "apps","shoply-app", "www", "js",  "app.json"), JSON.stringify(_bodyData), function(err){
                                            if (err) {
                                                return console.log(err);
                                            };
                                            
                                            Builder.Build(function(output){
                                                Builder.UploadLocal(function(_err, _data){
                                                  console.log("error", _err);
                                                  
                                                      var data = {};
                                                      !REQ.data || (data.data = JSON.parse(REQ.data));

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
                                    })
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
    apiRoutes.post("/" + _url_alias + "/build/", cpUpload, build);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}