module.exports = function(app, apiRoutes){
    var mongoose = require('mongoose');
    var userHelper = require('../models/userHelper');
    var path = require("path");
    var User = require('../models/user');
    var _batmanMailer = require(path.join(process.env.PWD , "helpers", "BatmanMailer", "index.js"));
    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));
    var crypto = require("crypto");

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

       if(req._permission){
           data._permission = mongoose.Types.ObjectId(req._permission);
       }

        userHelper.create(data, function(err, usuario){
          if(err){
              res.status(409).json({code : 11000});
              return;
          }

            if(usuario){
              res.status(200).json(usuario);

              var _html;
              var mailOptions = {
                    from: "listerine1989@gmail.com",
                    to: usuario.email,
                    subject: 'Bienvenido a Shoply'
              }     

              if(usuario.type == "USER"){
                    _html = _compiler.render({_data : {
                      name : usuario.name,
                      last_name : usuario.last_name,
                      email : usuario.email,
                      password : _plainPwd
                    }},'welcome/index.ejs');

                    mailOptions.html = _html;

              }else if(usuario.type == "SELLER"){

                    User.findOne({email : usuario.email}).populate("_company").exec(function(err, rs){
                        if(!err){
                            _html = _compiler.render({_data : {
                              name : usuario.name,
                              last_name : usuario.last_name,
                              email : usuario.email,
                              password : _plainPwd,
                              company : rs._company.data.empresa
                            }},'seller/index.ejs');

                            mailOptions.html = _html;

                            var _shell  = _batmanMailer.bulk([mailOptions]);

                            _shell.stdout.on('data', function(output) {
                                console.log('stdout: ' + output);
                            });

                            _shell.stderr.on('data', function(output) {
                                console.log('stdout: ' + output);
                            });

                            _shell.on('close', function(code) {
                                console.log('closing code: ' + code);
                            });                            
                          }
                    });

                    return;
              }
              
              var _shell  = _batmanMailer.bulk([mailOptions]);

              _shell.stdout.on('data', function(output) {
                  console.log('stdout: ' + output);
              });

              _shell.stderr.on('data', function(output) {
                  console.log('stdout: ' + output);
              });

              _shell.on('close', function(code) {
                  console.log('closing code: ' + code);
              });  
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

       if(REQ._permission){
           data._permission = mongoose.Types.ObjectId(REQ._permission._id || REQ._permission);
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
        .populate("_permission")
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
        .populate("_permission")
        .exec(function(err, rs){
            if(rs)
                res.json(rs);
            else
                res.json(err);
        })

    }

    function login(req, res){
            if (!req.body.email) {
                res.status(400).send({err : 'debe especificar un usuario'});
                return;
            }

            if (!req.body.password) {
                res.status(400).send({err : 'debe especificar un password'});
                return;
            }

          var jwt = require('jsonwebtoken');
          var UserSchema = require('../models/user');
          var Role = require('../models/roles');

         UserSchema.findOne({email : req.body.email}).populate("_company _permission").exec(function(err, user){
            if(!user){
                    res.status(401).json({err : 'Usuario o clave incorrectos'});
                    return;
             }

            if(user.auth(req.body.password)){
                  user.password = null;

                  var token = jwt.sign(user, app.get('secret'), {
                      expiresIn: 43200 // 24 horas (suficientes para una jornada laboral)
                    });

                  userHelper.createSession({token : token, user : user }, function(err, userToken){
                        res.status(200).json({token:token, user : user});
                  });  
            }else{
                  res.status(401).json({err: 'Usuario o clave incorrectos'});
            }
        });
    }

    function exists(req, res){
        User.exists(req.params.email.toLowerCase(), function(err, rs){
           rs = rs === 0 ? -1 : rs;

           res.status(200).json({ exists : rs});
        }) 
    }

    function passwordReset(req, res){
         var data = {};
         var REQ = req.body || req.params;

        if(REQ.newpwd == REQ.confirmpwd){
            User.findOne({ _id : mongoose.Types.ObjectId(REQ.id) }, function(err, rs){
                if(rs){
                        rs.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.newpwd);
                        rs.save(function(err, rs){
                            if(rs){
                                res.status(200).json({message : "ok"});
                            }
                        })
                }else{
                    res.status(404).json({message : "user not found"})
                }
            });            
        }else{
            res.status(400).json({message : "password not match"})
        }
    }

    function recover(req, res){
        var REQ = req.body || req.params;
        User.findOne({ email : REQ.email}, function(err, rs){
            if(rs){
                  crypto.pseudoRandomBytes(30, function (err, raw) {
                      rs.resetPasswordToken = raw;
                      rs.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                      rs.save(function(err, rs){
                          if(rs){
                              res.status(200).json({message : "ok"});

                              var _html;
                              var mailOptions = {
                                    from: "listerine1989@gmail.com",
                                    to: rs.email,
                                    subject: 'Recuperacion de Contraseña'
                              }

                              var _url = 'http://www.shoply.com/dist/#/forgot/' + rs.resetPasswordToken     

                              _html = _compiler.render({ _data : {
                                url : _url
                                } }, 'recover/index.ejs');

                               mailOptions.html = _html;

                              var _shell  = _batmanMailer.bulk([mailOptions]);

                              _shell.stdout.on('data', function(output) {
                                  console.log('stdout: ' + output);
                              });

                              _shell.stderr.on('data', function(output) {
                                  console.log('stdout: ' + output);
                              });

                              _shell.on('close', function(code) {
                                  console.log('closing code: ' + code);
                              }); 
                          }
                          })
                      }) 
                  }else{
                      res.status(404).json({message : "user not found"})
                  }                    
                  
                  }); 
    }

    apiRoutes.get('/user', users);
    apiRoutes.get('/user/:id', user);
    app.get('/api/user/exists/:email', exists);
    app.post('/api/password-reset/', passwordReset);
    app.post('/api/recover/', recover);
    app.post("/api/user", create);
    app.post("/api/login", login);
    apiRoutes.put("/user/:id", update);
    apiRoutes.delete("/user/:id", remove);

    return this;
}