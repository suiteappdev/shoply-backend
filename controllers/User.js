module.exports = function(app, apiRoutes){
    var mongoose = require('mongoose');
    var userHelper = require('../models/userHelper');
    var path = require("path");
    var User = require('../models/user');
    var _batmanMailer = require(path.join(process.env.PWD , "helpers", "BatmanMailer", "index.js"));
    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));


    function create(req, res){

        userHelper.create({
            name          : req.body.name,
            last_name     : req.body.last_name,
            password      : req.body.password,
            email         : req.body.email,
        }, function(err, usuario){

            if(usuario){
                usuario.usuario = usuario;
                var mailOptions = {
                      from: "listerine1989@gmail.com",
                      to: usuario.email,
                      subject: 'Welcome to shoply',
                      html: _compiler.render(usuario,'welcome/index.ejs')
                }

                var _shell  = _batmanMailer.bulk([mailOptions]);

                _shell.stdout.on('data', function(data) {
                    console.log('stdout: ' + data);
                });

                _shell.stderr.on('data', function(data) {
                    console.log('stdout: ' + data);
                });

                _shell.on('close', function(code) {
                    console.log('closing code: ' + code);
                });

                res.status(200).json(usuario);
            }
        });
    }

    function update(req, res){
         var data = {};
         var REQ = req.body || req.params;
         !REQ.metadata || (data.metadata = REQ.metadata);
         !REQ.username || (data.username = REQ.username);
         !REQ.password || (data.password = REQ.password);
         !REQ.email || (data.email = REQ.email);
         !REQ.name || (data.name = REQ.name);
         !REQ.last_name || (data.last_name = REQ.last_name);

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

        User.find()
        .exec(function(err, users){
            if(!err){
                res.send(users);
            }
        });
    }

    function user(req, res){
        var Role = require("../models/roles");

        User
        .findOne( mongoose.Types.ObjectId(req.params.id) )
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

         UserSchema.findOne({email : req.body.email}).populate("_role").exec(function(err, user){
            if(!user){
                    res.json({err : 'Usuario o clave incorrectos'}, 401);
                    return;
             }

            if(user.auth(req.body.password)){
                  user.password = null;

                  var token = jwt.sign(user, app.get('secret'), {
                      expiresIn: 43200 // 24 horas (suficientes para una jornada laboral)
                    });

                  userHelper.createSession({token : token, user : user }, function(err, userToken){
                        res.json({token:token, user : user});
                  });  
            }else{
                  res.json({err: 'Usuario o clave incorrectos'}, 401);
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

    apiRoutes.get('/user', users);
    apiRoutes.get('/user/:id', user);
    apiRoutes.get('/user/exists/:email', exists);
    app.post('/api/password-reset/', passwordReset);
    apiRoutes.post("/user", create);
    app.post("/api/login", login);
    apiRoutes.put("/user/:id", update);
    apiRoutes.delete("/user/:id", remove);

    return this;
}