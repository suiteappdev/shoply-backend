module.exports = function(app, apiRoutes, io){
  	var _entity ="push";
  	var _url_alias = "push";
  	var path = require("path");
    var mongoose = require('mongoose');
    var User = require('../models/user');
    var gcm = require('node-gcm');

    function register(req, res){
        var REQ = req.body || req.params;

	    console.log('device token received');
	      
		User.findOne({ _id : mongoose.Types.ObjectId(REQ.user) }, function(err, rs){
			if(rs){
			   rs.metadata.device = REQ.device_token;
			   rs.save();
	    		res.send('ok');
			}
		}); 
    }

    function push(req, res){
	    var device_tokens = []; //create array for storing device tokens
	    var retry_times = 4; //the number of times to retry sending the message if it fails

	    var sender = new gcm.Sender('AIzaSyAS1CNxO5NB9ytZs-9iPS57fHFVLGTYhrg'); //create a new sender
	    var message = new gcm.Message(); //create a new message

	    message.addData('title', 'New Message');
	    message.addData('message', 'Hello this is a push notification');
	    message.addData('sound', 'notification');

	    message.collapseKey = 'testing'; //grouping messages
	    message.delayWhileIdle = true; //delay sending while receiving device is offline
	    message.timeToLive = 3; //the number of seconds to keep the message on the server if the device is offline

	   	User.findOne({ _id : mongoose.Types.ObjectId(REQ.user) }, function(err, rs){
	    	device_tokens.push(rs.metadata.device);
	   	});

	    sender.send(message, device_tokens, retry_times, function(result){
	        console.log(result);
	        console.log('push sent to: ' + device_token);
	    });

	    res.send('ok');
    }

    apiRoutes.post("/" + _url_alias + "/register/:user/", register);
    apiRoutes.post("/" + _url_alias + "/push/:user/", push);

    return this;
}
