var aws = require('aws-sdk');
var crypto = require("crypto");
var EXTENTION  = '.jpeg';

aws.config.update({
    accessKeyId: "AKIAIBQ56J72L3L23YKQ",
    secretAccessKey: "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"
});

aws.config.update({region: 'us-west-2'});

var s3 = new aws.S3();

module.exports = {
	uploadToS3 : function(data, callback){
		_buffer = new Buffer(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
		
		crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);
            var _key = raw.toString('hex') + EXTENTION;

		    var data = {
		    	Bucket: 'shoplyassets',
			    Key: _key, 
			    Body: _buffer,
			    ContentEncoding: 'base64',
			    ContentType: 'image/jpeg'
	  		};

			s3.putObject(data, function(err, data){
				if(err){
					callback(err, null);
				}else{
					callback(null,  s3.getObject({Bucket: 'shoplyassets', Key: _key}));
				}
			});
        });
	}
}