var aws = require('aws-sdk');
var crypto = require("crypto");
var EXTENTION  = '.apk';
var BUCKET = 'shoply-apps';
var BASE_AMAZON = "http://s3.amazonaws.com/"+BUCKET+"/";
var fs = require('fs');
var PATH = require("path");

aws.config.update({
    accessKeyId: "AKIAIBQ56J72L3L23YKQ",
    secretAccessKey: "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"
});

aws.config.update({region: 'us-west-2'});
var s3 = new aws.S3();
module.exports = {
	Upload : function(app, callback){
		fs.readFile(PATH.join(pathprocess.env.PWD, "apps", "shoply-app", "platforms", "android,", "build", "outputs", "apk", "android-debug.apk"), function (err, _buffer) {
			console.log(_buffer);

				crypto.pseudoRandomBytes(16, function (err, raw) {
		            if (err) return cb(err);
		            var _key = raw.toString('hex') + EXTENTION;

				    var data = {
				    	Bucket: BUCKET,
					    Key: _key, 
					    Body: _buffer
			  		};

					s3.putObject(data, function(err, data){
						if(err){
							callback(err, null);
						}else{
							var URL = BASE_AMAZON  + _key;
							console.log(data);
							//callback(null, {url : URL});
						}
					});
		        });	  
		});
	},

	Build : function(callback){
        var exec = require('child_process').exec;
        var child = exec('sudo ionic build', {cwd: '/home/bitnami/backend/shoply-backend/apps/shoply-app/'});
        
        child.on('close', callback);
	}
}