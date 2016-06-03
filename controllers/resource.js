module.exports = function(app, apiRoutes, io){
    var mongoose = require('mongoose');
    var entity_name = "resource";

    var path = require("path");
    var model = require(path.join("../", "models", entity_name + ".js"));
    var jimp = require("jimp");

    function getbyId(req, res){
          var REQ = req.params;
          model.findOne({_id: REQ.id}, function(err, resource){
            jimp.read(path.normalize(resource.data.path) , function (err, image) {
                res.writeHead(200, {'Content-Type': resource.data.mimetype });

                image.getBuffer(resource.data.mimetype, function(_err, result){
                  res.end(result);           
                });
            });
          });
    }

    function getCrop(req, res){
          var REQ = req.params;

          model.findOne({_id: REQ.id}, function(err, resource){
            jimp.read(path.normalize(resource.data.path) , function (err, image) {
              res.writeHead(200, {'Content-Type': resource.data.mimetype });
              image.crop(parseInt(REQ.x), parseInt(REQ.y), parseInt(REQ.w), parseInt(REQ.h)).getBuffer(resource.data.mimetype, function(_err, result){
                res.end(result, 'binary');           
              });
            });
          });
    }
     
    app.get("/api/" + entity_name + "/image/:id", getbyId);      
    app.get("/api/" + entity_name + "/image/:id/:x/:y/:w/:h", getCrop);      

    return this;
}