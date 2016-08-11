module.exports = function(app, apiRoutes){
    var mongoose = require('mongoose');
    var userHelper = require('../models/userHelper');
    var path = require("path");
    var User = require('../models/user');
    var _batmanMailer = require(path.join(process.env.PWD , "helpers", "BatmanMailer", "index.js"));
    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));

    function create(req, res){
       var data = req.body;
       var _plainPwd = req.body.password;

       if(req.headers["x-shoply-company"]){
         data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
       }

       if(req._route){
           data._route = [];
          for(r in req._route){
             data._route.push(mongoose.Types.ObjectId(req._route[r]));
          }
       }

        userHelper.create(data, function(err, usuario){
		     if(err){
		         res.status(409).json({code : 11000});
		         return;
		     }

	        if(usuario){
	          res.status(200).json(usuario);
	        }
        });
    }

    function update(req, res){
         var data = {};
         var REQ = req.body || req.params;
         !REQ.metadata || (data.metadata = REQ.metadata);
         !REQ.data || (data.data = REQ.data);
         !REQ.username || (data.username = REQ.username);
         !REQ.password || (data.password = REQ.password);
         !REQ.email || (data.email = REQ.email);
         !REQ.name || (data.name = REQ.name);
         !REQ.last_name || (data.last_name = REQ.last_name);

         if(req.headers["x-soply-company"]){
           data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
         }

         if(REQ._route){
             data._route = [];
            for(r in REQ._route){
               data._route.push(mongoose.Types.ObjectId(REQ._route[r]));
            }
         }

         data = { $set : data }; 

         userHelper.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data, function(err, rs){
                    if(rs){
                        res.json(rs);
                                     
                    }
         });

    }

    function remove(req, res){
        userHelper.remove(req.params.id, function(err, user){
            if(!err){
                user.remove();
                res.status(200)
                res.end();
            }
        })
    }

    function users(req, res){
        var Role = require("../models/roles");

        User.find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
        .populate("_company")
        .populate("_route")
        .exec(function(err, users){
            if(!err){
                res.send(users);
            }
        });
    }

    function user(req, res){
        var Role = require("../models/roles");

        User
        .findOne( mongoose.Types.ObjectId(req.params.id))
        .populate("_company")
        .populate("_route")
        .exec(function(err, rs){
            if(rs)
                res.json(rs);
            else
                res.json(err);
        })

    }

    function exists(req, res){
        User.exists(req.params.email.toLowerCase(), function(err, rs){
           rs = rs === 0 ? -1 : rs;

           res.status(200).json({ exists : rs});
        }) 
    }

    apiRoutes.get('/cliente', users);
    apiRoutes.get('/cliente/:id', user);
    app.get('/api/cliente/exists/:email', exists);
    app.post("/api/cliente", create);
    apiRoutes.put("/cliente/:id", update);
    apiRoutes.delete("/cliente/:id", remove);

    return this;
}