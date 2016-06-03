module.exports = function(app, apiRoutes, io){
    var mongoose = require('mongoose');
    var multer  =   require('multer');
    var path = require("path");
    var model = require(path.join("../", "models", "resource.js"));
    var path = require("path");
    var crypto = require("crypto");
    var entity_name = "uploads";

    var storage =   multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, './uploads');
      },
      filename: function (req, file, callback) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
          if (err) return cb(err)
          callback(null, raw.toString('hex') + path.extname(file.originalname));
        })
      }
    });

    var upload = multer({ storage : storage}).single('file');

    function post(req, res, next){
        var data = {};
        data.data = req.file;

        var _data = new model(data);
        
        _data.save(function(err, saved){
            res.json(saved);
        });
    }

    app.post("/api/" + entity_name , upload, post);

    return this;
}