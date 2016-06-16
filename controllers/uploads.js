module.exports = function(app, apiRoutes, io){
    var mongoose = require('mongoose');
    var multer  =   require('multer');
    var path = require("path");
    var model = require(path.join("../", "models", "resource.js"));
    var path = require("path");
    var crypto = require("crypto");
    var multerS3 = require('multer-s3');
    var aws = require("aws-sdk");
    var entity_name = "uploads";

    var s3 = new aws.S3(aws.config.loadFromPath('./config.json'));

    var upload = multer({
        storage: multerS3({
            s3: s3,
            acl: 'public-read',
            bucket: 'shoplyassets',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: function (req, file, cb) {
              cb(null, {fieldName: file.fieldname});
            },
            key: function (req, file, cb) {
                  crypto.pseudoRandomBytes(16, function (err, raw) {
                    if (err) return cb(err)
                    cb(null, raw.toString('hex') + path.extname(file.originalname));
                  });           
            }
        })
    }).single('file');

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