module.exports = {
	render : function(bind){
		var path = require('path');
		var ejs = require("ejs");
		var fs = require("fs");

		var template = fs.readFileSync(path.join(process.env.PWD, 'templates', 'newsletter', 'routeEvent.ejs'), 'utf-8');

	    return ejs.render(template, bind);
	}
}