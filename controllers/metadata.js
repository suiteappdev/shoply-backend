module.exports = function(app, apiRoutes, io){
  	var _entity ="metadata";
  	var _url_alias = "metadata";

  	var path = require("path");
    var mongoose = require('mongoose');

    var _request = require(path.join("../", "models", "request.js"));
    var _apps = require(path.join("../", "models", "apps.js"));
    var _users = require(path.join("../", "models", "user.js"));
    var _products = require(path.join("../", "models", "product.js"));
    var _billing = require(path.join("../", "models", "billing.js"));

    function getRequest(req, res){

       _request
       .count({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getBillings(req, res){
       _billing
       .count({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }


    function getProducts(req, res){

      var REQ = req.params; 

       _products
       .count({
          _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), 
        })
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }



    function getEmployes(req, res){

      var REQ = req.params; 

       _users
       .count({type:"EMPLOYE", _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getClients(req, res){

      var REQ = req.params; 

       _users
       .count({ type:"CLIENT", _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    } 

    function getSellers(req, res){
      var REQ = req.params; 

       _seller
       .count({type:"SELLER", _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getApps(req, res){
       _apps
       .count({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    apiRoutes.get("/" + _url_alias,"/apps", getApps);
    apiRoutes.get("/" + _url_alias,"/pedidos", getRequest);
    apiRoutes.get("/" + _url_alias,"/productos", getProducts);
    apiRoutes.get("/" + _url_alias,"/empleados", getEmployes);
    apiRoutes.get("/" + _url_alias,"/clientes", getClients);
    apiRoutes.get("/" + _url_alias,"/vendedores", getSellers);

    return this;
}